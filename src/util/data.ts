export function groupBy<T>(
  array: T[],
  iteratee: (item: T) => string | number
): Record<string, T[]> {
  return array.reduce((result, item) => {
    const key = iteratee(item);

    if (!result[key]) {
      result[key] = [];
    }

    result[key].push(item);

    return result;
  }, {} as Record<string, T[]>);
}
