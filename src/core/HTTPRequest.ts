import axios, { AxiosResponse } from "axios";
import { Methods, Options } from "./types";

/**
 * HTTP request maker.
 */
export class HTTPRequest {
  /**
   * HTTP request maker.
   * @param baseUrl HTTP server base url.
   */
  constructor(private baseUrl: string) {}

  /**
   * Makes a HTTP Request.
   * @param url Endpoint url.
   * @param method HTTP method.
   * @param opts Request Options.
   * @returns Data from success request.
   */
  private base<U = any>(url: string, method: Methods, opts?: Options<any>) {
    return new Promise<U>(async (resolve, reject) => {
      const r = await axios(this.baseUrl + url, {
        data: opts?.body,
        method,
        headers: opts?.headers,
        timeout: opts?.timeout,
        maxBodyLength: opts?.maxBodyLength,
        withCredentials: opts?.withCredentials,
      }).catch((e) => {
        reject(e);
        return {} as AxiosResponse<U>;
      });

      resolve(r.data);
    });
  }

  /**
   * Makes a GET request.
   * @param url Endpoint url.
   * @param opts Request options.
   * @returns Data from success request.
   */
  async get<U = any>(url: string, opts?: Options<never>) {
    return await this.base<U>(url, "get", opts);
  }
  /**
   * Makes a POST request.
   * @param url Endpoint url.
   * @param opts Request options.
   * @returns Data from success request.
   */
  async post<T = object, U = any>(url: string, opts?: Options<U>) {
    return await this.base<T>(url, "post", opts);
  }
  /**
   * Makes a PUT request.
   * @param url Endpoint url.
   * @param opts Request options.
   * @returns Data from success request.
   */
  async put<T = object, U = any>(url: string, opts?: Options<U>) {
    return await this.base<T>(url, "put", opts);
  }
  /**
   * Makes a DELETE request.
   * @param url Endpoint url.
   * @param opts Request options.
   * @returns Data from success request.
   */
  async delete<T = object, U = any>(url: string, opts?: Options<U>) {
    return await this.base<T>(url, "delete", opts);
  }
}
