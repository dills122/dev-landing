interface DatedPost {
  data: {
    pubDate: Date;
    updatedDate?: Date;
  };
}

export const getLatestPostDate = <Post extends DatedPost>(posts: Post[]) =>
  posts.reduce<Date | undefined>((latest, post) => {
    const postDate = post.data.updatedDate ?? post.data.pubDate;

    if (!latest || postDate.valueOf() > latest.valueOf()) {
      return postDate;
    }

    return latest;
  }, undefined);

export const slugifyTag = (tag: string) => {
  const slug = tag
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/#/g, " sharp ")
    .replace(/\+/g, " plus ")
    .replace(/&/g, " and ")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "tag";
};
