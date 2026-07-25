/* eslint-disable prettier/prettier, no-mixed-operators, eqeqeq */
export class PaginationUtil {
  public static calculateSkip(page: number, limit: number): number {
    if (!page) {
      return 0;
    }

    return (page - 1) * limit;
  }

  public static calculateTotalPage(totalCount: number, limit: number): number {
    return Math.floor(totalCount / limit) + (totalCount % limit > 0 ? 1 : 0);
  }

  public static calculatePercentage(
    currentPage: number,
    totalPage: number,
  ): number {
    return Math.round((currentPage / (totalPage == 0 ? 1 : totalPage) * 100) * 100) / 100;
  }
}
