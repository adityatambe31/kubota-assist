import { ITIssue } from "./models/ITIssue";
import { TicketType } from "../../../types/global";

export async function findSolutionsByCategory(category: string) {
  try {
    const solutions = await ITIssue.find({ category })
      .select({
        title: 1,
        solution: 1,
        category: 1,
      })
      .limit(3)
      .lean();

    return solutions.map((solution: any) => ({
      title: solution.title,
      solution: Array.isArray(solution.solution)
        ? solution.solution
        : [solution.solution],
      category: solution.category,
    }));
  } catch (error) {
    console.error("Error finding solutions by category:", error);
    return [];
  }
}

export async function searchSolutions(query: string, category?: TicketType) {
  try {
    // Build the search query
    const searchQuery = category
      ? {
          $and: [{ $text: { $search: query } }, { category }],
        }
      : { $text: { $search: query } };

    // Execute search with text score sorting
    const solutions = await ITIssue.find(searchQuery)
      .select({
        title: 1,
        solution: 1,
        category: 1,
        score: { $meta: "textScore" },
      })
      .sort({ score: { $meta: "textScore" } })
      .limit(3)
      .lean();

    // Transform the solutions into a consistent format
    return solutions.map((solution: any) => ({
      id: solution._id.toString(),
      title: solution.title,
      solution: Array.isArray(solution.solution)
        ? solution.solution
        : [solution.solution],
      category: solution.category,
    }));
  } catch (error) {
    console.error("Error searching solutions:", error);
    return [];
  }
}
