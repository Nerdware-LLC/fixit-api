export abstract class CustomErrorAbstractClass extends Error {
  public status: number;
  public statusCode?: number;

  constructor(params: any) {
    super(params);
    this.status = 401;
    this.statusCode = 401;
  }
}
