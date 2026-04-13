module.exports = {
    layout: "layouts/blog-post.njk",
    eleventyComputed: {
        permalink: function (data) {
            if (data.draft) return false;
            return "/blog/posts/" + data.page.fileSlug + "/";
        },
        eleventyExcludeFromCollections: function (data) {
            return data.draft ? true : false;
        },
    },
};
