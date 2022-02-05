import chroma from "chroma-js";

export function colorScheme(key: number | "default" | "danger") {
  if (key === "default") return "#00000050";
  if (key === "danger") return "#ff000080";
  return chroma.brewer.Set2[key % 10];
}

export function getColorByCategories(
  { feedbackCategories }: Assignment,
  categories: FeedbackCategory[]
) {
  switch (categories.length) {
    case 0:
      return colorScheme("default");
    case 1:
      return colorScheme(
        feedbackCategories.findIndex((c) => c.id === categories[0].id)
      );
    default:
      return colorScheme("danger");
  }
}
