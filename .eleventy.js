module.exports = function (eleventyConfig) {
    // Passthrough copy -- everything that isn't a template
    eleventyConfig.addPassthroughCopy("index.html");
    eleventyConfig.addPassthroughCopy("assets");
    eleventyConfig.addPassthroughCopy("pert");
    eleventyConfig.addPassthroughCopy("cidr-calculator");
    eleventyConfig.addPassthroughCopy("aikido");
    eleventyConfig.addPassthroughCopy("whatthepatch");
    eleventyConfig.addPassthroughCopy("blog/css");
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
