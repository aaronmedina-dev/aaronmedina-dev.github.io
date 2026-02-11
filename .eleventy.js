var syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");

module.exports = function (eleventyConfig) {
    eleventyConfig.addPlugin(syntaxHighlight);

    // Passthrough copy -- everything that isn't a template
    eleventyConfig.addPassthroughCopy("index.html");
    eleventyConfig.addPassthroughCopy("assets");
    eleventyConfig.addPassthroughCopy("pert");
    eleventyConfig.addPassthroughCopy("cidr-calculator");
    eleventyConfig.addPassthroughCopy("aikido");
    eleventyConfig.addPassthroughCopy("whatthepatch");
    eleventyConfig.addPassthroughCopy("blog/css");
    eleventyConfig.addPassthroughCopy("blog/images");
    eleventyConfig.addPassthroughCopy("favicon.svg");
    eleventyConfig.addPassthroughCopy("robots.txt");
    eleventyConfig.addPassthroughCopy("google7f425c781d89ca1f.html");
    // Ignore non-blog markdown files from template processing
    eleventyConfig.ignores.add("AGENTS.md");
    eleventyConfig.ignores.add("pert/README.md");
    eleventyConfig.ignores.add("aikido/sub-issue-formatter/README.md");
    eleventyConfig.ignores.add("whatthepatch/README.md");
    eleventyConfig.ignores.add("IGNORE/");

    // Blog posts collection sorted newest-first
    eleventyConfig.addCollection("posts", function (collectionApi) {
        return collectionApi
            .getFilteredByGlob("blog/posts/*.md")
            .sort(function (a, b) {
                return b.date - a.date;
            });
    });

    // Date formatting filter: "Jan 15, 2026"
    eleventyConfig.addFilter("dateFormat", function (date) {
        return new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    });

    // ISO date filter for sitemap
    eleventyConfig.addFilter("isoDate", function (date) {
        var d = date === "now" ? new Date() : new Date(date);
        return d.toISOString().split("T")[0];
    });

    // Wrap code blocks with language header bar
    eleventyConfig.addTransform("codeBlockWrapper", function (content) {
        if (this.page.outputPath && this.page.outputPath.endsWith(".html")) {
            content = content.replace(
                /<pre class="language-(\w+)">/g,
                function (match, lang) {
                    var labels = {
                        js: "JavaScript", javascript: "JavaScript",
                        ts: "TypeScript", typescript: "TypeScript",
                        html: "HTML", css: "CSS", scss: "SCSS",
                        bash: "Bash", sh: "Shell", shell: "Shell",
                        json: "JSON", yaml: "YAML", yml: "YAML",
                        xml: "XML", sql: "SQL", py: "Python",
                        python: "Python", ruby: "Ruby", go: "Go",
                        rust: "Rust", java: "Java", md: "Markdown",
                        markdown: "Markdown", dockerfile: "Dockerfile",
                        hcl: "HCL", tf: "Terraform"
                    };
                    var label = labels[lang] || lang.toUpperCase();
                    return '<div class="code-block-wrapper"><div class="code-header"><span class="code-lang">' + label + '</span><button class="code-copy" aria-label="Copy code"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>Copy</button></div><pre class="language-' + lang + '">';
                }
            );
            content = content.replace(
                /<\/pre>(?!\s*<\/div>)/g,
                function (match, offset) {
                    var before = content.substring(Math.max(0, offset - 200), offset);
                    if (before.indexOf('code-block-wrapper') !== -1) {
                        return '</pre></div>';
                    }
                    return match;
                }
            );
        }
        return content;
    });

    return {
        dir: {
            input: ".",
            output: "_site",
            includes: "_includes",
            data: "_data",
        },
        templateFormats: ["njk", "md"],
    };
};
