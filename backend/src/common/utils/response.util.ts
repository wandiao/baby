export class ResponseUtil {
  static success<T>(data: T, msg: string = '成功') {
    return {
      code: 200,
      data,
      msg,
    };
  }

  static error(code: number, msg: string) {
    return {
      code,
      data: null,
      msg,
    };
  }
}