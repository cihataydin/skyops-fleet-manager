/**
 * A utility class containing methods for working with repository data.
 */
export class BaseRespositoryUtil {
  /**
   * Converts the keys of an object from snake_case to camelCase.
   *
   * This method takes an object with snake_case keys and converts each key to camelCase format.
   * It returns a new object with the converted keys while preserving the original values.
   *
   * @template T - The type of the object being passed in. The return type will be the same type.
   *
   * @param {T} obj - The object whose keys are in snake_case and need to be converted to camelCase.
   * @returns {T} A new object with keys converted to camelCase.
   *
   * @example
   * const snakeCaseObj = { first_name: 'John', last_name: 'Doe' };
   * const camelCaseObj = BaseRespositoryUtil.convertKeysFromSnakeCaseToCamelCase(snakeCaseObj);
   * console.log(camelCaseObj); // { firstName: 'John', lastName: 'Doe' }
   */
  public static convertKeysFromSnakeCaseToCamelCase<T>(obj: T = {} as T): T {
    const result = {};
    Object.entries(obj).forEach(([key, value]) => {
      const camelCaseKey = key.replace(/_([a-z])/g, (_, letter) =>
        letter.toUpperCase(),
      );
      result[camelCaseKey] = value;
    });

    return result as T;
  }
}
