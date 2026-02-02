function isValidIPv4(ip) {
    const parts = ip.trim().split('.');
    if (parts.length !== 4) return false;
    return parts.every(p => {
        if (!/^\d+$/.test(p)) return false;
        const n = Number(p);
        return n >= 0 && n <= 255;
    });
}

function ipToInt(ip) {
    return ip.split('.').reduce((acc, oct) => (acc << 8) + Number(oct), 0) >>> 0;
}

function intToIp(num) {
    return [24, 16, 8, 0].map(shift => (num >>> shift) & 255).join('.');
}

function prefixToMask(prefix) {
    const p = Number(prefix);
    const maskInt = p === 0 ? 0 : (0xFFFFFFFF << (32 - p)) >>> 0;
    return { maskInt, maskStr: intToIp(maskInt) };
}

function wildcardFromMask(maskInt) {
    const wildcard = (~maskInt) >>> 0;
    return intToIp(wildcard);
}

function computeNetworkInfo(ipStr, prefix) {
    if (!isValidIPv4(ipStr)) {
        throw new Error('Invalid IPv4 address');
    }
    const p = Number(prefix);
    if (isNaN(p) || p < 0 || p > 32) {
        throw new Error('Prefix length must be between 0 and 32');
    }

    const ipInt = ipToInt(ipStr);
    const { maskInt, maskStr } = prefixToMask(p);
    const network = (ipInt & maskInt) >>> 0;
    const broadcast = (network | (~maskInt >>> 0)) >>> 0;
    const total = 2 ** (32 - p);

    let usable = 0;
    let firstHost = 'N/A';
    let lastHost = 'N/A';
    let broadcastStr = intToIp(broadcast);

    if (p <= 30) {
        usable = total - 2;
        firstHost = intToIp((network + 1) >>> 0);
        lastHost = intToIp((broadcast - 1) >>> 0);
    } else if (p === 31) {
        // Point-to-point: 2 addresses, no broadcast; represent as N/A for hosts
        usable = 2;
        broadcastStr = 'N/A';
    } else {
        // /32 single host
        usable = 1;
        broadcastStr = 'N/A';
    }

    return {
        input: `${ipStr}/${p}`,
        network: intToIp(network),
        broadcast: broadcastStr,
        firstHost,
        lastHost,
        totalAddresses: total,
        usableHosts: usable,
        netmask: maskStr,
        wildcard: wildcardFromMask(maskInt),
        cidr: `${intToIp(network)}/${p}`
    };
}

function renderResults(info) {
    const tbody = document.getElementById('result-body');
    tbody.innerHTML = '';
    const rows = [
        ['Input', info.input],
        ['Network Address', info.network],
        ['Netmask', info.netmask],
        ['Wildcard Mask', info.wildcard],
        ['Broadcast Address', info.broadcast],
        ['First Host', info.firstHost],
        ['Last Host', info.lastHost],
        ['Total Addresses', String(info.totalAddresses)],
        ['Usable Hosts', String(info.usableHosts)],
        ['CIDR Notation', info.cidr]
    ];
    for (const [k, v] of rows) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${k}</td><td>${v}</td>`;
        tbody.appendChild(tr);
    }
}

function toText(info) {
    return [
        `Input: ${info.input}`,
        `Network Address: ${info.network}`,
        `Netmask: ${info.netmask}`,
        `Wildcard Mask: ${info.wildcard}`,
        `Broadcast Address: ${info.broadcast}`,
        `First Host: ${info.firstHost}`,
        `Last Host: ${info.lastHost}`,
        `Total Addresses: ${info.totalAddresses}`,
        `Usable Hosts: ${info.usableHosts}`,
        `CIDR Notation: ${info.cidr}`
    ].join('\n');
}

function calculate() {
    const ip = document.getElementById('ipInput').value.trim();
    const p = document.getElementById('prefixInput').value.trim();
    if (!ip) { alert('Please enter an IPv4 address.'); return; }
    try {
        const info = computeNetworkInfo(ip, Number(p));
        renderResults(info);
        window.__lastCIDRInfo = info;
        // Update dependent views if visible
        const activeView = document.querySelector('.view-toggle .toggle-btn.active')?.dataset.view;
        if (activeView === 'subnets') renderSubnets();
        if (activeView === 'addresses') renderAddressesPage(0);
        if (activeView === 'bits') renderBits();
    } catch (e) {
        alert(e.message);
    }
}

function resetForm() {
    document.getElementById('ipInput').value = '';
    document.getElementById('prefixInput').value = 24;
    document.getElementById('result-body').innerHTML = '';
}

document.getElementById('calculateBtn').addEventListener('click', calculate);
document.getElementById('resetBtn').addEventListener('click', resetForm);
document.getElementById('copyText').addEventListener('click', function() {
    const info = window.__lastCIDRInfo;
    if (!info) { alert('Nothing to copy. Calculate first.'); return; }
    navigator.clipboard.writeText(toText(info)).then(() => alert('Copied as text'));
});
document.getElementById('copyJson').addEventListener('click', function() {
    const info = window.__lastCIDRInfo;
    if (!info) { alert('Nothing to copy. Calculate first.'); return; }
    const blob = new Blob([JSON.stringify(info, null, 2)], { type: 'application/json' });
    const item = new ClipboardItem({ 'application/json': blob });
    navigator.clipboard.write([item]).then(() => alert('Copied as JSON'));
});

// View toggling
document.querySelectorAll('.toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const view = btn.dataset.view;
        document.querySelectorAll('.view-section').forEach(sec => sec.classList.remove('active'));
        document.getElementById(`view-${view}`).classList.add('active');
        if (!window.__lastCIDRInfo) return;
        if (view === 'subnets') renderSubnets();
        if (view === 'addresses') renderAddressesPage(0);
        if (view === 'bits') renderBits();
    });
});

// Subnets view
function renderSubnets() {
    const info = window.__lastCIDRInfo;
    const body = document.getElementById('subnets-body');
    const hint = document.getElementById('subnets-hint');
    const note = document.getElementById('subnets-note');
    body.innerHTML = '';
    note.textContent = '';
    if (!info) { hint.style.display = 'block'; return; }
    hint.style.display = 'none';

    const basePrefix = Number(info.input.split('/')[1]);
    const target = Number(document.getElementById('subnetPrefix').value);
    if (isNaN(target) || target < basePrefix || target > 32) {
        note.textContent = `Target prefix must be between ${basePrefix} and 32.`;
        return;
    }
    const baseNetInt = ipToInt(info.network);
    const blockSize = 2 ** (32 - target);
    const subnetCount = 2 ** (target - basePrefix);
    const maxRows = 1024;
    const rowsToShow = Math.min(subnetCount, maxRows);

    for (let i = 0; i < rowsToShow; i++) {
        const start = (baseNetInt + i * blockSize) >>> 0;
        const end = (start + blockSize - 1) >>> 0;
        const p = target;
        let firstHost = 'N/A', lastHost = 'N/A';
        let usable = 0;
        if (p <= 30) {
            firstHost = intToIp((start + 1) >>> 0);
            lastHost = intToIp((end - 1) >>> 0);
            usable = blockSize - 2;
        } else if (p === 31) {
            usable = 2;
        } else {
            usable = 1;
        }
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${intToIp(start)}/${p}</td>
            <td>${firstHost}</td>
            <td>${lastHost}</td>
            <td>${usable}</td>
        `;
        body.appendChild(tr);
    }
    if (subnetCount > maxRows) {
        note.textContent = `Showing first ${maxRows} of ${subnetCount} subnets. Increase target prefix to narrow results.`;
    }
}
document.getElementById('genSubnetsBtn').addEventListener('click', renderSubnets);

// Addresses view
let __addrPage = 0;
function totalAddresses(info) { return info.totalAddresses; }
function addrStartInt(info) { return ipToInt(info.network); }
function addrEndInt(info) {
    if (info.broadcast !== 'N/A') return ipToInt(info.broadcast);
    // /31 or /32
    const p = Number(info.input.split('/')[1]);
    const net = addrStartInt(info);
    const size = 2 ** (32 - p);
    return (net + size - 1) >>> 0;
}
function addrRole(ipInt, info) {
    const p = Number(info.input.split('/')[1]);
    if (p >= 31) return 'host';
    const net = addrStartInt(info);
    const bcast = ipToInt(info.broadcast);
    if (ipInt === net) return 'network';
    if (ipInt === bcast) return 'broadcast';
    return 'host';
}
function renderAddressesPage(page) {
    const info = window.__lastCIDRInfo;
    const body = document.getElementById('addresses-body');
    const pageInfo = document.getElementById('pageInfo');
    const hint = document.getElementById('addresses-hint');
    body.innerHTML = '';
    if (!info) { hint.style.display = 'block'; pageInfo.textContent=''; return; }
    hint.style.display = 'none';

    const total = totalAddresses(info);
    const start = addrStartInt(info);
    const end = addrEndInt(info);
    const pageSize = Number(document.getElementById('pageSize').value);

    const maxForUI = 1 << 16; // 65536
    if (total > maxForUI) {
        pageInfo.textContent = `Block has ${total} addresses. Use CSV download for full list.`;
        return;
    }

    const totalPages = Math.ceil(total / pageSize);
    __addrPage = Math.min(Math.max(0, page), Math.max(0, totalPages - 1));

    const globalStartIndex = __addrPage * pageSize;
    const startIpInt = (start + globalStartIndex) >>> 0;
    const rows = Math.min(pageSize, total - globalStartIndex);
    for (let i = 0; i < rows; i++) {
        const ipInt = (startIpInt + i) >>> 0;
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${globalStartIndex + i + 1}</td>
            <td>${intToIp(ipInt)}</td>
            <td>${addrRole(ipInt, info)}</td>
        `;
        body.appendChild(tr);
    }
    const from = globalStartIndex + 1;
    const to = globalStartIndex + rows;
    pageInfo.textContent = `Showing ${from}-${to} of ${total}`;
}
document.getElementById('prevPage').addEventListener('click', () => {
    if (!window.__lastCIDRInfo) return;
    renderAddressesPage(__addrPage - 1);
});
document.getElementById('nextPage').addEventListener('click', () => {
    if (!window.__lastCIDRInfo) return;
    renderAddressesPage(__addrPage + 1);
});
document.getElementById('pageSize').addEventListener('change', () => {
    if (!window.__lastCIDRInfo) return;
    renderAddressesPage(0);
});

// CSV download
document.getElementById('downloadCSV').addEventListener('click', () => {
    const info = window.__lastCIDRInfo;
    if (!info) { alert('Calculate first.'); return; }
    const total = totalAddresses(info);
    const start = addrStartInt(info);
    const lines = ['index,ip,role'];
    const maxCSV = 1 << 17; // 131072 lines limit safeguard
    const lim = Math.min(total, maxCSV);
    for (let i = 0; i < lim; i++) {
        const ipInt = (start + i) >>> 0;
        const ipStr = intToIp(ipInt);
        lines.push(`${i + 1},${ipStr},${addrRole(ipInt, info)}`);
    }
    if (total > maxCSV) lines.push(`# Truncated at ${maxCSV} rows`);
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `addresses-${info.cidr.replace('/', '-')}.csv`;
    a.click();
});

// Bits view
function toBinary32(num) {
    return (num >>> 0).toString(2).padStart(32, '0');
}
function renderBits() {
    const info = window.__lastCIDRInfo;
    const out = document.getElementById('bits-output');
    out.innerHTML = '';
    if (!info) { out.innerHTML = '<div class="hint">Calculate first to view bit breakdown.</div>'; return; }
    const p = Number(info.input.split('/')[1]);
    const ipInt = ipToInt(info.input.split('/')[0]);
    const maskInt = (prefixToMask(p)).maskInt;
    const netInt = ipToInt(info.network);
    const wildInt = (~maskInt) >>> 0;

    const bits = [
        ['IP', toBinary32(ipInt), intToIp(ipInt)],
        ['Mask', toBinary32(maskInt), intToIp(maskInt)],
        ['Wildcard', toBinary32(wildInt), intToIp(wildInt)],
        ['Network', toBinary32(netInt), intToIp(netInt)]
    ];
    for (const [label, bin, dec] of bits) {
        const row = document.createElement('div');
        row.className = 'bits-row';
        const l = document.createElement('div');
        l.className = 'bits-label';
        l.textContent = label;
        const grid = document.createElement('div');
        grid.className = 'bits-binary';
        for (let i = 0; i < 32; i++) {
            const bitEl = document.createElement('div');
            bitEl.className = 'bit ' + (i < p ? 'net' : 'host');
            bitEl.textContent = bin[i];
            grid.appendChild(bitEl);
        }
        const oct = document.createElement('div');
        oct.className = 'octets';
        const octets = [0,8,16,24].map(s => parseInt(bin.slice(s, s+8), 2)).join('.');
        oct.textContent = dec + '  (' + octets + ')';
        row.appendChild(l);
        row.appendChild(grid);
        row.appendChild(oct);
        out.appendChild(row);
    }
}
