/* eslint-disable */
import 'isomorphic-fetch';

class ApiCSM {
  constructor() {
    this.baseUrl = null;
    this.token = null;
  }

  serializeQueryParams(parameters) {
    const str = [];
    for (let p in parameters) {
      if (parameters.hasOwnProperty(p)) {
        str.push(
          `${encodeURIComponent(p)}=${encodeURIComponent(parameters[p])}`,
        );
      }
    }
    return str.join('&');
  }

  paramsToObject(params) {
    let query = params.substr(1);
    let result = {};
    query.split('&').forEach(function(part) {
      let item = part.split('=');
      result[item[0]] = decodeURIComponent(item[1]);
    });
    return result;
  }

  mergeQueryParams(parameters, queryParameters) {
    if (parameters.$queryParameters) {
      Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
        const parameter = parameters.$queryParameters[parameterName];
        queryParameters[parameterName] = parameter;
      });
    }
    return queryParameters;
  }

  /**
   * HTTP Request
   * @method
   * @param {string} method - http method
   * @param {string} url - url to do request
   * @param {object} body - body parameters / object
   * @param {object} headers - header parameters
   * @param {object} queryParameters - querystring parameters
   */
  request(
    method,
    url,
    body,
    headers,
    queryParameters,
    form,
    checkFor401 = true,
  ) {
    const queryParams =
      queryParameters && Object.keys(queryParameters).length
        ? this.serializeQueryParams(queryParameters)
        : null;
    const urlWithParams = url + (queryParams ? '?' + queryParams : '');

    // ugly hack, we need to delete Content-Type header with multipart/form-data
    // that way, browser will calculate form specific headers on it's own
    // contentTypeHeader[0] because nearly every header's value is set using array
    const contentTypeHeader = headers['Content-Type'];
    if (contentTypeHeader && contentTypeHeader[0] === 'multipart/form-data') {
      delete headers['Content-Type'];
    }

    if (body && !Object.keys(body).length) {
      body = undefined;
    } else {
      body = JSON.stringify(body);
    }

    if (form && Object.keys(form).length) {
      body = new FormData();
      for (let k in form) {
        body.append(k, form[k]);
      }
    }

    return fetch(urlWithParams, {
      method,
      headers,
      body,
    })
      .then(response => {
        if (checkFor401) {
          if (response.status === 401) {
            if (typeof this._onResponseUnauthorized === 'function') {
              this._onResponseUnauthorized();
            } else {
              let error = new Error(response.statusText);
              error.response = response;
              throw error;
            }
          }
        }

        if (response.ok) {
          if (
            response.headers.get('Content-Type').includes('application/json')
          ) {
            return response.json();
          } else if (
            response.headers.get('Content-Type').includes('application/pdf')
          ) {
            return response.blob();
          }
          return {};
        } else {
          let error = new Error(response.statusText);
          error.response = response;
          throw error;
        }
      })
      .catch(error => {
        return error.response.json().then(error_details => {
          error.details = error_details;
          throw error;
        });
      });
  }

  /**
   * Set base url
   * @method
   * @param {string} baseUrl
   */
  setBaseUrl(baseUrl) {
    this.baseUrl = baseUrl;
  }

  set onResponseUnauthorized(callback) {
    this._onResponseUnauthorized = callback;
  }

  /**
   * Redirects a user to a given url
   * @method
   * @param {string} url
   */
  redirect(url) {
    window.location = url;
  }

  /**
   * Set Token
   * @method
   * @param {string} token - token's value
   */
  setToken(token) {
    this.token = token;
  }

  /**
   * Set Auth headers
   * @method
   * @param {object} headerParams - headers object
   */
  setAuthHeaders(headerParams) {
    let headers = headerParams ? headerParams : {};
    if (this.token) {
      headers['Authorization'] = 'Bearer ' + this.token;
    }
    return headers;
  }

  /**
   * Get Contentspace Details
   * @method
   * @param {object} parameters - method options and parameters
   * @param {string} contentspace -
   */
  getContentspace(contentspace, parameters = {}) {
    let path = '/admin/{contentspace}';
    let body = {};
    let queryParameters = {};
    let headers = {};
    let form = {};

    headers = Object.assign({}, headers, this.setAuthHeaders(headers));
    headers['Accept'] = ['application/json'];
    headers['Content-Type'] = ['application/json'];

    path = path.replace('{contentspace}', contentspace);

    queryParameters = this.mergeQueryParams(parameters, queryParameters);

    return this.request(
      'GET',
      `${this.baseUrl}${path}`,
      body,
      headers,
      queryParameters,
      form,
    );
  }

  /**
   * Edit Contentspace Settings or/and Doctypes
   * @method
   * @param {object} parameters - method options and parameters
   * @param {} parameters.data -
   * @param {string} contentspace -
   */
  editContentspace(contentspace, parameters = {}) {
    let path = '/admin/{contentspace}';
    let body = {};
    let queryParameters = {};
    let headers = {};
    let form = {};

    headers = Object.assign({}, headers, this.setAuthHeaders(headers));
    headers['Accept'] = ['application/json'];
    headers['Content-Type'] = ['application/json'];

    if (parameters['data'] !== undefined) {
      body = parameters['data'];
    }

    path = path.replace('{contentspace}', contentspace);

    queryParameters = this.mergeQueryParams(parameters, queryParameters);

    return this.request(
      'PUT',
      `${this.baseUrl}${path}`,
      body,
      headers,
      queryParameters,
      form,
    );
  }

  /**
   * Get Doctypes for Contentspace
   * @method
   * @param {object} parameters - method options and parameters
   * @param {string} contentspace -
   */
  getDoctypes(contentspace, parameters = {}) {
    let path = '/admin/{contentspace}/doctypes';
    let body = {};
    let queryParameters = {};
    let headers = {};
    let form = {};

    headers = Object.assign({}, headers, this.setAuthHeaders(headers));
    headers['Accept'] = ['application/json'];
    headers['Content-Type'] = ['application/json'];

    path = path.replace('{contentspace}', contentspace);

    queryParameters = this.mergeQueryParams(parameters, queryParameters);

    return this.request(
      'GET',
      `${this.baseUrl}${path}`,
      body,
      headers,
      queryParameters,
      form,
    );
  }

  /**
   * Edit Contentspace Doctypes
   * @method
   * @param {object} parameters - method options and parameters
   * @param {} parameters.data -
   * @param {string} contentspace -
   */
  editDoctypes(contentspace, parameters = {}) {
    let path = '/admin/{contentspace}/doctypes';
    let body = {};
    let queryParameters = {};
    let headers = {};
    let form = {};

    headers = Object.assign({}, headers, this.setAuthHeaders(headers));
    headers['Accept'] = ['application/json'];
    headers['Content-Type'] = ['application/json'];

    if (parameters['data'] !== undefined) {
      body = parameters['data'];
    }

    path = path.replace('{contentspace}', contentspace);

    queryParameters = this.mergeQueryParams(parameters, queryParameters);

    return this.request(
      'POST',
      `${this.baseUrl}${path}`,
      body,
      headers,
      queryParameters,
      form,
    );
  }

  /**
   * Delete Contentspace Doctype
   * @method
   * @param {object} parameters - method options and parameters
   * @param {string} contentspace -
   * @param {string} doctypeId -
   */
  deleteDoctype(contentspace, doctypeId, parameters = {}) {
    let path = '/admin/{contentspace}/doctypes/{doctype_id}';
    let body = {};
    let queryParameters = {};
    let headers = {};
    let form = {};

    headers = Object.assign({}, headers, this.setAuthHeaders(headers));
    headers['Accept'] = ['application/json'];
    headers['Content-Type'] = ['application/json'];

    path = path.replace('{contentspace}', contentspace);

    path = path.replace('{doctype_id}', doctypeId);

    queryParameters = this.mergeQueryParams(parameters, queryParameters);

    return this.request(
      'DELETE',
      `${this.baseUrl}${path}`,
      body,
      headers,
      queryParameters,
      form,
    );
  }

  /**
   * Get User By Tokeninfo
   * @method
   * @param {object} parameters - method options and parameters
   * @param {string} contentspace -
   */
  getUserByTokeninfo(contentspace, parameters = {}) {
    let path = '/admin/{contentspace}/user';
    let body = {};
    let queryParameters = {};
    let headers = {};
    let form = {};

    headers = Object.assign({}, headers, this.setAuthHeaders(headers));
    headers['Accept'] = ['application/json'];
    headers['Content-Type'] = ['application/json'];

    path = path.replace('{contentspace}', contentspace);

    queryParameters = this.mergeQueryParams(parameters, queryParameters);

    return this.request(
      'GET',
      `${this.baseUrl}${path}`,
      body,
      headers,
      queryParameters,
      form,
    );
  }

  /**
   * Returns List of Articles with possibility to offset and limit results. Also possible to filter results by smarttags and doctype.
   * @method
   * @param {object} parameters - method options and parameters
   * @param {number} parameters.offset -
   * @param {number} parameters.limit -
   * @param {array} parameters.doctype -
   * @param {array} parameters.smarttags -
   * @param {string} contentspace -
   */
  getArticles(contentspace, parameters = {}) {
    let path = '/admin/{contentspace}/article';
    let body = {};
    let queryParameters = {};
    let headers = {};
    let form = {};

    headers = Object.assign({}, headers, this.setAuthHeaders(headers));
    headers['Accept'] = ['application/json'];
    headers['Content-Type'] = ['application/json'];

    if (parameters['offset'] !== undefined) {
      queryParameters['offset'] = parameters['offset'];
    }

    /** set default value **/
    queryParameters['limit'] = '50';

    if (parameters['limit'] !== undefined) {
      queryParameters['limit'] = parameters['limit'];
    }

    if (parameters['doctype'] !== undefined) {
      queryParameters['doctype'] = parameters['doctype'];
    }

    if (parameters['smarttags'] !== undefined) {
      queryParameters['smarttags'] = parameters['smarttags'];
    }

    path = path.replace('{contentspace}', contentspace);

    queryParameters = this.mergeQueryParams(parameters, queryParameters);

    return this.request(
      'GET',
      `${this.baseUrl}${path}`,
      body,
      headers,
      queryParameters,
      form,
    );
  }

  /**
   * Insert New Article with Given Properties
   * @method
   * @param {object} parameters - method options and parameters
   * @param {} parameters.data -
   * @param {string} contentspace -
   */
  postArticle(contentspace, parameters = {}) {
    let path = '/admin/{contentspace}/article';
    let body = {};
    let queryParameters = {};
    let headers = {};
    let form = {};

    headers = Object.assign({}, headers, this.setAuthHeaders(headers));
    headers['Accept'] = ['application/json'];
    headers['Content-Type'] = ['application/json'];

    if (parameters['data'] !== undefined) {
      body = parameters['data'];
    }

    path = path.replace('{contentspace}', contentspace);

    queryParameters = this.mergeQueryParams(parameters, queryParameters);

    return this.request(
      'POST',
      `${this.baseUrl}${path}`,
      body,
      headers,
      queryParameters,
      form,
    );
  }

  /**
   * Returns Article By ID
   * @method
   * @param {object} parameters - method options and parameters
   * @param {string} contentspace -
   * @param {integer} articleId -
   */
  getArticle(contentspace, articleId, parameters = {}) {
    let path = '/admin/{contentspace}/article/{article_id}';
    let body = {};
    let queryParameters = {};
    let headers = {};
    let form = {};

    headers = Object.assign({}, headers, this.setAuthHeaders(headers));
    headers['Accept'] = ['application/json'];
    headers['Content-Type'] = ['application/json'];

    path = path.replace('{contentspace}', contentspace);

    path = path.replace('{article_id}', articleId);

    queryParameters = this.mergeQueryParams(parameters, queryParameters);

    return this.request(
      'GET',
      `${this.baseUrl}${path}`,
      body,
      headers,
      queryParameters,
      form,
    );
  }

  /**
   * Edit Article By ID
   * @method
   * @param {object} parameters - method options and parameters
   * @param {} parameters.data -
   * @param {string} contentspace -
   * @param {integer} articleId -
   */
  editArticle(contentspace, articleId, parameters = {}) {
    let path = '/admin/{contentspace}/article/{article_id}';
    let body = {};
    let queryParameters = {};
    let headers = {};
    let form = {};

    headers = Object.assign({}, headers, this.setAuthHeaders(headers));
    headers['Accept'] = ['application/json'];
    headers['Content-Type'] = ['application/json'];

    if (parameters['data'] !== undefined) {
      body = parameters['data'];
    }

    path = path.replace('{contentspace}', contentspace);

    path = path.replace('{article_id}', articleId);

    queryParameters = this.mergeQueryParams(parameters, queryParameters);

    return this.request(
      'PUT',
      `${this.baseUrl}${path}`,
      body,
      headers,
      queryParameters,
      form,
    );
  }

  /**
   * Delete Article By ID
   * @method
   * @param {object} parameters - method options and parameters
   * @param {string} contentspace -
   * @param {integer} articleId -
   */
  deleteArticle(contentspace, articleId, parameters = {}) {
    let path = '/admin/{contentspace}/article/{article_id}';
    let body = {};
    let queryParameters = {};
    let headers = {};
    let form = {};

    headers = Object.assign({}, headers, this.setAuthHeaders(headers));
    headers['Accept'] = ['application/json'];
    headers['Content-Type'] = ['application/json'];

    path = path.replace('{contentspace}', contentspace);

    path = path.replace('{article_id}', articleId);

    queryParameters = this.mergeQueryParams(parameters, queryParameters);

    return this.request(
      'DELETE',
      `${this.baseUrl}${path}`,
      body,
      headers,
      queryParameters,
      form,
    );
  }

  /**
   * Returns List of Sections
   * @method
   * @param {object} parameters - method options and parameters
   * @param {string} contentspace -
   */
  getSections(contentspace, parameters = {}) {
    let path = '/admin/{contentspace}/section';
    let body = {};
    let queryParameters = {};
    let headers = {};
    let form = {};

    headers = Object.assign({}, headers, this.setAuthHeaders(headers));
    headers['Accept'] = ['application/json'];
    headers['Content-Type'] = ['application/json'];

    path = path.replace('{contentspace}', contentspace);

    queryParameters = this.mergeQueryParams(parameters, queryParameters);

    return this.request(
      'GET',
      `${this.baseUrl}${path}`,
      body,
      headers,
      queryParameters,
      form,
    );
  }

  /**
   * Insert New Section with Given Properties
   * @method
   * @param {object} parameters - method options and parameters
   * @param {} parameters.data -
   * @param {string} contentspace -
   */
  postSection(contentspace, parameters = {}) {
    let path = '/admin/{contentspace}/section';
    let body = {};
    let queryParameters = {};
    let headers = {};
    let form = {};

    headers = Object.assign({}, headers, this.setAuthHeaders(headers));
    headers['Accept'] = ['application/json'];
    headers['Content-Type'] = ['application/json'];

    if (parameters['data'] !== undefined) {
      body = parameters['data'];
    }

    path = path.replace('{contentspace}', contentspace);

    queryParameters = this.mergeQueryParams(parameters, queryParameters);

    return this.request(
      'POST',
      `${this.baseUrl}${path}`,
      body,
      headers,
      queryParameters,
      form,
    );
  }

  /**
   * Returns Detail of Section
   * @method
   * @param {object} parameters - method options and parameters
   * @param {string} contentspace -
   * @param {integer} sectionId -
   */
  getSection(contentspace, sectionId, parameters = {}) {
    let path = '/admin/{contentspace}/section/{section_id}';
    let body = {};
    let queryParameters = {};
    let headers = {};
    let form = {};

    headers = Object.assign({}, headers, this.setAuthHeaders(headers));
    headers['Accept'] = ['application/json'];
    headers['Content-Type'] = ['application/json'];

    path = path.replace('{contentspace}', contentspace);

    path = path.replace('{section_id}', sectionId);

    queryParameters = this.mergeQueryParams(parameters, queryParameters);

    return this.request(
      'GET',
      `${this.baseUrl}${path}`,
      body,
      headers,
      queryParameters,
      form,
    );
  }

  /**
   * Insert New Section with Given Properties As Subsection to Parent ID
   * @method
   * @param {object} parameters - method options and parameters
   * @param {} parameters.data -
   * @param {string} contentspace -
   * @param {integer} sectionId -
   */
  postSubsection(contentspace, sectionId, parameters = {}) {
    let path = '/admin/{contentspace}/section/{section_id}';
    let body = {};
    let queryParameters = {};
    let headers = {};
    let form = {};

    headers = Object.assign({}, headers, this.setAuthHeaders(headers));
    headers['Accept'] = ['application/json'];
    headers['Content-Type'] = ['application/json'];

    if (parameters['data'] !== undefined) {
      body = parameters['data'];
    }

    path = path.replace('{contentspace}', contentspace);

    path = path.replace('{section_id}', sectionId);

    queryParameters = this.mergeQueryParams(parameters, queryParameters);

    return this.request(
      'POST',
      `${this.baseUrl}${path}`,
      body,
      headers,
      queryParameters,
      form,
    );
  }

  /**
   * Edit Section
   * @method
   * @param {object} parameters - method options and parameters
   * @param {} parameters.data -
   * @param {string} contentspace -
   * @param {integer} sectionId -
   */
  editSection(contentspace, sectionId, parameters = {}) {
    let path = '/admin/{contentspace}/section/{section_id}';
    let body = {};
    let queryParameters = {};
    let headers = {};
    let form = {};

    headers = Object.assign({}, headers, this.setAuthHeaders(headers));
    headers['Accept'] = ['application/json'];
    headers['Content-Type'] = ['application/json'];

    if (parameters['data'] !== undefined) {
      body = parameters['data'];
    }

    path = path.replace('{contentspace}', contentspace);

    path = path.replace('{section_id}', sectionId);

    queryParameters = this.mergeQueryParams(parameters, queryParameters);

    return this.request(
      'PUT',
      `${this.baseUrl}${path}`,
      body,
      headers,
      queryParameters,
      form,
    );
  }

  /**
   * Delete Section
   * @method
   * @param {object} parameters - method options and parameters
   * @param {string} contentspace -
   * @param {integer} sectionId -
   */
  deleteSection(contentspace, sectionId, parameters = {}) {
    let path = '/admin/{contentspace}/section/{section_id}';
    let body = {};
    let queryParameters = {};
    let headers = {};
    let form = {};

    headers = Object.assign({}, headers, this.setAuthHeaders(headers));
    headers['Accept'] = ['application/json'];
    headers['Content-Type'] = ['application/json'];

    path = path.replace('{contentspace}', contentspace);

    path = path.replace('{section_id}', sectionId);

    queryParameters = this.mergeQueryParams(parameters, queryParameters);

    return this.request(
      'DELETE',
      `${this.baseUrl}${path}`,
      body,
      headers,
      queryParameters,
      form,
    );
  }

  /**
   * Get List of Users With Allowed Access For Given Section Id
   * @method
   * @param {object} parameters - method options and parameters
   * @param {string} contentspace -
   * @param {integer} sectionId -
   */
  getSectionAllowedUsers(contentspace, sectionId, parameters = {}) {
    let path = '/admin/{contentspace}/section/{section_id}/allowed-users';
    let body = {};
    let queryParameters = {};
    let headers = {};
    let form = {};

    headers = Object.assign({}, headers, this.setAuthHeaders(headers));
    headers['Accept'] = ['application/json'];
    headers['Content-Type'] = ['application/json'];

    path = path.replace('{contentspace}', contentspace);

    path = path.replace('{section_id}', sectionId);

    queryParameters = this.mergeQueryParams(parameters, queryParameters);

    return this.request(
      'GET',
      `${this.baseUrl}${path}`,
      body,
      headers,
      queryParameters,
      form,
    );
  }

  /**
   * Grant Access For Given User and Section Id
   * @method
   * @param {object} parameters - method options and parameters
   * @param {} parameters.data -
   * @param {string} contentspace -
   * @param {integer} sectionId -
   * @param {string} userId -
   */
  grantSectionAccess(contentspace, sectionId, userId, parameters = {}) {
    let path =
      '/admin/{contentspace}/section/{section_id}/allowed-users/{user_id}';
    let body = {};
    let queryParameters = {};
    let headers = {};
    let form = {};

    headers = Object.assign({}, headers, this.setAuthHeaders(headers));
    headers['Accept'] = ['application/json'];
    headers['Content-Type'] = ['application/json'];

    if (parameters['data'] !== undefined) {
      body = parameters['data'];
    }

    path = path.replace('{contentspace}', contentspace);

    path = path.replace('{section_id}', sectionId);

    path = path.replace('{user_id}', userId);

    queryParameters = this.mergeQueryParams(parameters, queryParameters);

    return this.request(
      'POST',
      `${this.baseUrl}${path}`,
      body,
      headers,
      queryParameters,
      form,
    );
  }

  /**
   * Remove Access For Given User and Section Id
   * @method
   * @param {object} parameters - method options and parameters
   * @param {string} contentspace -
   * @param {integer} sectionId -
   * @param {string} userId -
   */
  removeSectionAccess(contentspace, sectionId, userId, parameters = {}) {
    let path =
      '/admin/{contentspace}/section/{section_id}/allowed-users/{user_id}';
    let body = {};
    let queryParameters = {};
    let headers = {};
    let form = {};

    headers = Object.assign({}, headers, this.setAuthHeaders(headers));
    headers['Accept'] = ['application/json'];
    headers['Content-Type'] = ['application/json'];

    path = path.replace('{contentspace}', contentspace);

    path = path.replace('{section_id}', sectionId);

    path = path.replace('{user_id}', userId);

    queryParameters = this.mergeQueryParams(parameters, queryParameters);

    return this.request(
      'DELETE',
      `${this.baseUrl}${path}`,
      body,
      headers,
      queryParameters,
      form,
    );
  }

  /**
   * Get List of Subsections for Given Parent Section ID
   * @method
   * @param {object} parameters - method options and parameters
   * @param {string} contentspace -
   * @param {integer} sectionId -
   */
  getSubsections(contentspace, sectionId, parameters = {}) {
    let path = '/admin/{contentspace}/section/{section_id}/sections';
    let body = {};
    let queryParameters = {};
    let headers = {};
    let form = {};

    headers = Object.assign({}, headers, this.setAuthHeaders(headers));
    headers['Accept'] = ['application/json'];
    headers['Content-Type'] = ['application/json'];

    path = path.replace('{contentspace}', contentspace);

    path = path.replace('{section_id}', sectionId);

    queryParameters = this.mergeQueryParams(parameters, queryParameters);

    return this.request(
      'GET',
      `${this.baseUrl}${path}`,
      body,
      headers,
      queryParameters,
      form,
    );
  }

  /**
   * Get Detail of Section Content
   * @method
   * @param {object} parameters - method options and parameters
   * @param {string} contentspace -
   * @param {integer} sectionId -
   */
  getSectionContent(contentspace, sectionId, parameters = {}) {
    let path = '/admin/{contentspace}/section/{section_id}/content';
    let body = {};
    let queryParameters = {};
    let headers = {};
    let form = {};

    headers = Object.assign({}, headers, this.setAuthHeaders(headers));
    headers['Accept'] = ['application/json'];
    headers['Content-Type'] = ['application/json'];

    path = path.replace('{contentspace}', contentspace);

    path = path.replace('{section_id}', sectionId);

    queryParameters = this.mergeQueryParams(parameters, queryParameters);

    return this.request(
      'GET',
      `${this.baseUrl}${path}`,
      body,
      headers,
      queryParameters,
      form,
    );
  }

  /**
   * Create Section Content
   * @method
   * @param {object} parameters - method options and parameters
   * @param {} parameters.data -
   * @param {string} contentspace -
   * @param {integer} sectionId -
   */
  postSectionContent(contentspace, sectionId, parameters = {}) {
    let path = '/admin/{contentspace}/section/{section_id}/content';
    let body = {};
    let queryParameters = {};
    let headers = {};
    let form = {};

    headers = Object.assign({}, headers, this.setAuthHeaders(headers));
    headers['Accept'] = ['application/json'];
    headers['Content-Type'] = ['application/json'];

    if (parameters['data'] !== undefined) {
      body = parameters['data'];
    }

    path = path.replace('{contentspace}', contentspace);

    path = path.replace('{section_id}', sectionId);

    queryParameters = this.mergeQueryParams(parameters, queryParameters);

    return this.request(
      'POST',
      `${this.baseUrl}${path}`,
      body,
      headers,
      queryParameters,
      form,
    );
  }

  /**
   * Edit Section Content
   * @method
   * @param {object} parameters - method options and parameters
   * @param {} parameters.data -
   * @param {string} contentspace -
   * @param {integer} sectionId -
   */
  editSectionContent(contentspace, sectionId, parameters = {}) {
    let path = '/admin/{contentspace}/section/{section_id}/content';
    let body = {};
    let queryParameters = {};
    let headers = {};
    let form = {};

    headers = Object.assign({}, headers, this.setAuthHeaders(headers));
    headers['Accept'] = ['application/json'];
    headers['Content-Type'] = ['application/json'];

    if (parameters['data'] !== undefined) {
      body = parameters['data'];
    }

    path = path.replace('{contentspace}', contentspace);

    path = path.replace('{section_id}', sectionId);

    queryParameters = this.mergeQueryParams(parameters, queryParameters);

    return this.request(
      'PUT',
      `${this.baseUrl}${path}`,
      body,
      headers,
      queryParameters,
      form,
    );
  }

  /**
   * Delete Section Content
   * @method
   * @param {object} parameters - method options and parameters
   * @param {string} contentspace -
   * @param {integer} sectionId -
   */
  deleteSectionContent(contentspace, sectionId, parameters = {}) {
    let path = '/admin/{contentspace}/section/{section_id}/content';
    let body = {};
    let queryParameters = {};
    let headers = {};
    let form = {};

    headers = Object.assign({}, headers, this.setAuthHeaders(headers));
    headers['Accept'] = ['application/json'];
    headers['Content-Type'] = ['application/json'];

    path = path.replace('{contentspace}', contentspace);

    path = path.replace('{section_id}', sectionId);

    queryParameters = this.mergeQueryParams(parameters, queryParameters);

    return this.request(
      'DELETE',
      `${this.baseUrl}${path}`,
      body,
      headers,
      queryParameters,
      form,
    );
  }

  /**
   * Provide List of Articles By Section Id
   * @method
   * @param {object} parameters - method options and parameters
   * @param {number} parameters.offset -
   * @param {number} parameters.limit -
   * @param {array} parameters.doctype -
   * @param {array} parameters.smarttags -
   * @param {string} contentspace -
   * @param {integer} sectionId -
   */
  getArticlesBySectionId(contentspace, sectionId, parameters = {}) {
    let path = '/admin/{contentspace}/section/{section_id}/articles';
    let body = {};
    let queryParameters = {};
    let headers = {};
    let form = {};

    headers = Object.assign({}, headers, this.setAuthHeaders(headers));
    headers['Accept'] = ['application/json'];
    headers['Content-Type'] = ['application/json'];

    if (parameters['offset'] !== undefined) {
      queryParameters['offset'] = parameters['offset'];
    }

    /** set default value **/
    queryParameters['limit'] = '50';

    if (parameters['limit'] !== undefined) {
      queryParameters['limit'] = parameters['limit'];
    }

    if (parameters['doctype'] !== undefined) {
      queryParameters['doctype'] = parameters['doctype'];
    }

    if (parameters['smarttags'] !== undefined) {
      queryParameters['smarttags'] = parameters['smarttags'];
    }

    path = path.replace('{contentspace}', contentspace);

    path = path.replace('{section_id}', sectionId);

    queryParameters = this.mergeQueryParams(parameters, queryParameters);

    return this.request(
      'GET',
      `${this.baseUrl}${path}`,
      body,
      headers,
      queryParameters,
      form,
    );
  }

  /**
   * Add Article For Provided Section Id
   * @method
   * @param {object} parameters - method options and parameters
   * @param {} parameters.data -
   * @param {string} contentspace -
   * @param {integer} sectionId -
   */
  postArticleBySectionId(contentspace, sectionId, parameters = {}) {
    let path = '/admin/{contentspace}/section/{section_id}/articles';
    let body = {};
    let queryParameters = {};
    let headers = {};
    let form = {};

    headers = Object.assign({}, headers, this.setAuthHeaders(headers));
    headers['Accept'] = ['application/json'];
    headers['Content-Type'] = ['application/json'];

    if (parameters['data'] !== undefined) {
      body = parameters['data'];
    }

    path = path.replace('{contentspace}', contentspace);

    path = path.replace('{section_id}', sectionId);

    queryParameters = this.mergeQueryParams(parameters, queryParameters);

    return this.request(
      'POST',
      `${this.baseUrl}${path}`,
      body,
      headers,
      queryParameters,
      form,
    );
  }

  /**
   * Change Ordering of Sections In Current Level
   * @method
   * @param {object} parameters - method options and parameters
   * @param {} parameters.data -
   * @param {string} contentspace -
   */
  changeOrderOfSections(contentspace, parameters = {}) {
    let path = '/admin/{contentspace}/sections/order';
    let body = {};
    let queryParameters = {};
    let headers = {};
    let form = {};

    headers = Object.assign({}, headers, this.setAuthHeaders(headers));
    headers['Accept'] = ['application/json'];
    headers['Content-Type'] = ['application/json'];

    if (parameters['data'] !== undefined) {
      body = parameters['data'];
    }

    path = path.replace('{contentspace}', contentspace);

    queryParameters = this.mergeQueryParams(parameters, queryParameters);

    return this.request(
      'POST',
      `${this.baseUrl}${path}`,
      body,
      headers,
      queryParameters,
      form,
    );
  }

  /**
   * Provide List of Static Contents
   * @method
   * @param {object} parameters - method options and parameters
   * @param {string} contentspace -
   */
  getStaticContents(contentspace, parameters = {}) {
    let path = '/admin/{contentspace}/static-content';
    let body = {};
    let queryParameters = {};
    let headers = {};
    let form = {};

    headers = Object.assign({}, headers, this.setAuthHeaders(headers));
    headers['Accept'] = ['application/json'];
    headers['Content-Type'] = ['application/json'];

    path = path.replace('{contentspace}', contentspace);

    queryParameters = this.mergeQueryParams(parameters, queryParameters);

    return this.request(
      'GET',
      `${this.baseUrl}${path}`,
      body,
      headers,
      queryParameters,
      form,
    );
  }

  /**
   * Provide Detail of Static Content
   * @method
   * @param {object} parameters - method options and parameters
   * @param {string} contentspace -
   * @param {string} cid -
   */
  getStaticContent(contentspace, cid, parameters = {}) {
    let path = '/admin/{contentspace}/static-content/{cid}';
    let body = {};
    let queryParameters = {};
    let headers = {};
    let form = {};

    headers = Object.assign({}, headers, this.setAuthHeaders(headers));
    headers['Accept'] = ['application/json'];
    headers['Content-Type'] = ['application/json'];

    path = path.replace('{contentspace}', contentspace);

    path = path.replace('{cid}', cid);

    queryParameters = this.mergeQueryParams(parameters, queryParameters);

    return this.request(
      'GET',
      `${this.baseUrl}${path}`,
      body,
      headers,
      queryParameters,
      form,
    );
  }

  /**
   * Insert New Static Content
   * @method
   * @param {object} parameters - method options and parameters
   * @param {} parameters.data -
   * @param {string} contentspace -
   * @param {string} cid -
   */
  postStaticContent(contentspace, cid, parameters = {}) {
    let path = '/admin/{contentspace}/static-content/{cid}';
    let body = {};
    let queryParameters = {};
    let headers = {};
    let form = {};

    headers = Object.assign({}, headers, this.setAuthHeaders(headers));
    headers['Accept'] = ['application/json'];
    headers['Content-Type'] = ['application/json'];

    if (parameters['data'] !== undefined) {
      body = parameters['data'];
    }

    path = path.replace('{contentspace}', contentspace);

    path = path.replace('{cid}', cid);

    queryParameters = this.mergeQueryParams(parameters, queryParameters);

    return this.request(
      'POST',
      `${this.baseUrl}${path}`,
      body,
      headers,
      queryParameters,
      form,
    );
  }

  /**
   * Edit Static Content
   * @method
   * @param {object} parameters - method options and parameters
   * @param {} parameters.data -
   * @param {string} contentspace -
   * @param {string} cid -
   */
  editStaticContent(contentspace, cid, parameters = {}) {
    let path = '/admin/{contentspace}/static-content/{cid}';
    let body = {};
    let queryParameters = {};
    let headers = {};
    let form = {};

    headers = Object.assign({}, headers, this.setAuthHeaders(headers));
    headers['Accept'] = ['application/json'];
    headers['Content-Type'] = ['application/json'];

    if (parameters['data'] !== undefined) {
      body = parameters['data'];
    }

    path = path.replace('{contentspace}', contentspace);

    path = path.replace('{cid}', cid);

    queryParameters = this.mergeQueryParams(parameters, queryParameters);

    return this.request(
      'PUT',
      `${this.baseUrl}${path}`,
      body,
      headers,
      queryParameters,
      form,
    );
  }

  /**
   * Delete Static Content
   * @method
   * @param {object} parameters - method options and parameters
   * @param {string} contentspace -
   * @param {string} cid -
   */
  deleteStaticContent(contentspace, cid, parameters = {}) {
    let path = '/admin/{contentspace}/static-content/{cid}';
    let body = {};
    let queryParameters = {};
    let headers = {};
    let form = {};

    headers = Object.assign({}, headers, this.setAuthHeaders(headers));
    headers['Accept'] = ['application/json'];
    headers['Content-Type'] = ['application/json'];

    path = path.replace('{contentspace}', contentspace);

    path = path.replace('{cid}', cid);

    queryParameters = this.mergeQueryParams(parameters, queryParameters);

    return this.request(
      'DELETE',
      `${this.baseUrl}${path}`,
      body,
      headers,
      queryParameters,
      form,
    );
  }

  /**
   * Provide Article for Static Content
   * @method
   * @param {object} parameters - method options and parameters
   * @param {string} contentspace -
   * @param {string} cid -
   */
  getArticleByStaticContentId(contentspace, cid, parameters = {}) {
    let path = '/admin/{contentspace}/static-content/{cid}/content';
    let body = {};
    let queryParameters = {};
    let headers = {};
    let form = {};

    headers = Object.assign({}, headers, this.setAuthHeaders(headers));
    headers['Accept'] = ['application/json'];
    headers['Content-Type'] = ['application/json'];

    path = path.replace('{contentspace}', contentspace);

    path = path.replace('{cid}', cid);

    queryParameters = this.mergeQueryParams(parameters, queryParameters);

    return this.request(
      'GET',
      `${this.baseUrl}${path}`,
      body,
      headers,
      queryParameters,
      form,
    );
  }

  /**
   * Insert Content For Static Content
   * @method
   * @param {object} parameters - method options and parameters
   * @param {} parameters.data -
   * @param {string} contentspace -
   * @param {string} cid -
   */
  postArticleForStaticContent(contentspace, cid, parameters = {}) {
    let path = '/admin/{contentspace}/static-content/{cid}/content';
    let body = {};
    let queryParameters = {};
    let headers = {};
    let form = {};

    headers = Object.assign({}, headers, this.setAuthHeaders(headers));
    headers['Accept'] = ['application/json'];
    headers['Content-Type'] = ['application/json'];

    if (parameters['data'] !== undefined) {
      body = parameters['data'];
    }

    path = path.replace('{contentspace}', contentspace);

    path = path.replace('{cid}', cid);

    queryParameters = this.mergeQueryParams(parameters, queryParameters);

    return this.request(
      'POST',
      `${this.baseUrl}${path}`,
      body,
      headers,
      queryParameters,
      form,
    );
  }

  /**
   * Edit Content For Static Content
   * @method
   * @param {object} parameters - method options and parameters
   * @param {} parameters.data -
   * @param {string} contentspace -
   * @param {string} cid -
   */
  editArticleForStaticContent(contentspace, cid, parameters = {}) {
    let path = '/admin/{contentspace}/static-content/{cid}/content';
    let body = {};
    let queryParameters = {};
    let headers = {};
    let form = {};

    headers = Object.assign({}, headers, this.setAuthHeaders(headers));
    headers['Accept'] = ['application/json'];
    headers['Content-Type'] = ['application/json'];

    if (parameters['data'] !== undefined) {
      body = parameters['data'];
    }

    path = path.replace('{contentspace}', contentspace);

    path = path.replace('{cid}', cid);

    queryParameters = this.mergeQueryParams(parameters, queryParameters);

    return this.request(
      'PUT',
      `${this.baseUrl}${path}`,
      body,
      headers,
      queryParameters,
      form,
    );
  }

  /**
   * Delete Content For Static Content
   * @method
   * @param {object} parameters - method options and parameters
   * @param {string} contentspace -
   * @param {string} cid -
   */
  deleteArticleForStaticContent(contentspace, cid, parameters = {}) {
    let path = '/admin/{contentspace}/static-content/{cid}/content';
    let body = {};
    let queryParameters = {};
    let headers = {};
    let form = {};

    headers = Object.assign({}, headers, this.setAuthHeaders(headers));
    headers['Accept'] = ['application/json'];
    headers['Content-Type'] = ['application/json'];

    path = path.replace('{contentspace}', contentspace);

    path = path.replace('{cid}', cid);

    queryParameters = this.mergeQueryParams(parameters, queryParameters);

    return this.request(
      'DELETE',
      `${this.baseUrl}${path}`,
      body,
      headers,
      queryParameters,
      form,
    );
  }

  /**
   * Fetch Settings for Given Contentspace
   * @method
   * @param {object} parameters - method options and parameters
   * @param {string} contentspace -
   */
  getSettings(contentspace, parameters = {}) {
    let path = '/public/{contentspace}/settings';
    let body = {};
    let queryParameters = {};
    let headers = {};
    let form = {};

    headers['Accept'] = ['application/json'];
    headers['Content-Type'] = ['application/json'];

    path = path.replace('{contentspace}', contentspace);

    queryParameters = this.mergeQueryParams(parameters, queryParameters);

    return this.request(
      'GET',
      `${this.baseUrl}${path}`,
      body,
      headers,
      queryParameters,
      form,
    );
  }

  /**
   * Sends a mail from any contact form using data from app space settings
   * @method
   * @param {object} parameters - method options and parameters
   * @param {} parameters.data -
   * @param {string} contentspace -
   */
  webContactFormRequest(contentspace, parameters = {}) {
    let path = '/public/{contentspace}/request/web-contact-form';
    let body = {};
    let queryParameters = {};
    let headers = {};
    let form = {};

    headers['Accept'] = ['application/json'];
    headers['Content-Type'] = ['application/json'];

    if (parameters['data'] !== undefined) {
      body = parameters['data'];
    }

    if (parameters['data'] === undefined) {
      throw Error('Missing required  parameter: data');
    }

    path = path.replace('{contentspace}', contentspace);

    queryParameters = this.mergeQueryParams(parameters, queryParameters);

    return this.request(
      'POST',
      `${this.baseUrl}${path}`,
      body,
      headers,
      queryParameters,
      form,
    );
  }

  /**
   * Fetch URL map for Given URL
   * @method
   * @param {object} parameters - method options and parameters
   * @param {string} contentspace -
   * @param {string} parameters.urlPath -
   * @param {number} parameters.expandObject -
   */
  getContentByUrl(contentspace, parameters = {}) {
    let path = '/public/{contentspace}/urlmap';
    let body = {};
    let queryParameters = {};
    let headers = {};
    let form = {};

    headers['Accept'] = ['application/json'];
    headers['Content-Type'] = ['application/json'];

    path = path.replace('{contentspace}', contentspace);

    if (parameters['urlPath'] !== undefined) {
      queryParameters['url_path'] = parameters['urlPath'];
    }

    if (parameters['expandObject'] !== undefined) {
      queryParameters['expand_object'] = parameters['expandObject'];
    }

    queryParameters = this.mergeQueryParams(parameters, queryParameters);

    return this.request(
      'GET',
      `${this.baseUrl}${path}`,
      body,
      headers,
      queryParameters,
      form,
    );
  }

  /**
   * Fetch URL map for Given URL
   * @method
   * @param {object} parameters - method options and parameters
   * @param {string} contentspace -
   * @param {string} urlPath -
   * @param {number} parameters.expandObject -
   */
  getContentByUrl_1(contentspace, urlPath, parameters = {}) {
    let path = '/public/{contentspace}/urlmap/{url_path}';
    let body = {};
    let queryParameters = {};
    let headers = {};
    let form = {};

    headers['Accept'] = ['application/json'];
    headers['Content-Type'] = ['application/json'];

    path = path.replace('{contentspace}', contentspace);

    path = path.replace('{url_path}', urlPath);

    if (parameters['expandObject'] !== undefined) {
      queryParameters['expand_object'] = parameters['expandObject'];
    }

    queryParameters = this.mergeQueryParams(parameters, queryParameters);

    return this.request(
      'GET',
      `${this.baseUrl}${path}`,
      body,
      headers,
      queryParameters,
      form,
    );
  }

  /**
   * Fetch Content of Sections By Widget Type
   * @method
   * @param {object} parameters - method options and parameters
   * @param {string} contentspace -
   * @param {string} widgetType -
   */
  getSectionContentByWidgetType(contentspace, widgetType, parameters = {}) {
    let path = '/public/{contentspace}/sectiondescr-widgets/{widget_type}';
    let body = {};
    let queryParameters = {};
    let headers = {};
    let form = {};

    headers['Accept'] = ['application/json'];
    headers['Content-Type'] = ['application/json'];

    path = path.replace('{contentspace}', contentspace);

    path = path.replace('{widget_type}', widgetType);

    queryParameters = this.mergeQueryParams(parameters, queryParameters);

    return this.request(
      'GET',
      `${this.baseUrl}${path}`,
      body,
      headers,
      queryParameters,
      form,
    );
  }

  /**
   * Fetch Public Articles
   * @method
   * @param {object} parameters - method options and parameters
   * @param {number} parameters.offset -
   * @param {number} parameters.limit -
   * @param {array} parameters.tag -
   * @param {array} parameters.widgets -
   * @param {array} parameters.widgetsType -
   * @param {array} parameters.excludetags -
   * @param {array} parameters.smarttags -
   * @param {array} parameters.doctypes -
   * @param {string} parameters.q -
   * @param {string} parameters.sorter -
   * @param {array} contentspaceList -
   */
  getPublicArticles(contentspaceList, parameters = {}) {
    let path = '/public/{contentspace_list}/articles';
    let body = {};
    let queryParameters = {};
    let headers = {};
    let form = {};

    headers['Accept'] = ['application/json'];
    headers['Content-Type'] = ['application/json'];

    if (parameters['offset'] !== undefined) {
      queryParameters['offset'] = parameters['offset'];
    }

    /** set default value **/
    queryParameters['limit'] = '50';

    if (parameters['limit'] !== undefined) {
      queryParameters['limit'] = parameters['limit'];
    }

    if (parameters['tag'] !== undefined) {
      queryParameters['tag'] = parameters['tag'];
    }

    if (parameters['widgets'] !== undefined) {
      queryParameters['widgets'] = parameters['widgets'];
    }

    if (parameters['widgetsType'] !== undefined) {
      queryParameters['widgets_type'] = parameters['widgetsType'];
    }

    if (parameters['excludetags'] !== undefined) {
      queryParameters['excludetags'] = parameters['excludetags'];
    }

    if (parameters['smarttags'] !== undefined) {
      queryParameters['smarttags'] = parameters['smarttags'];
    }

    if (parameters['doctypes'] !== undefined) {
      queryParameters['doctypes'] = parameters['doctypes'];
    }

    if (parameters['q'] !== undefined) {
      queryParameters['q'] = parameters['q'];
    }

    if (parameters['sorter'] !== undefined) {
      queryParameters['sorter'] = parameters['sorter'];
    }

    path = path.replace('{contentspace_list}', contentspaceList);

    queryParameters = this.mergeQueryParams(parameters, queryParameters);

    return this.request(
      'GET',
      `${this.baseUrl}${path}`,
      body,
      headers,
      queryParameters,
      form,
    );
  }

  /**
   * Fetch Public Article By Slug
   * @method
   * @param {object} parameters - method options and parameters
   * @param {string} contentspace -
   * @param {string} articleIdOrSlug -
   */
  getPublicArticlesByIdOrSlug(contentspace, articleIdOrSlug, parameters = {}) {
    let path = '/public/{contentspace}/articles/{article_idOrSlug}';
    let body = {};
    let queryParameters = {};
    let headers = {};
    let form = {};

    headers = Object.assign({}, headers, this.setAuthHeaders(headers));
    headers['Accept'] = ['application/json'];
    headers['Content-Type'] = ['application/json'];

    path = path.replace('{contentspace}', contentspace);

    path = path.replace('{article_idOrSlug}', articleIdOrSlug);

    queryParameters = this.mergeQueryParams(parameters, queryParameters);

    return this.request(
      'GET',
      `${this.baseUrl}${path}`,
      body,
      headers,
      queryParameters,
      form,
    );
  }

  /**
   * Edit Stats of Public Article By Slug
   * @method
   * @param {object} parameters - method options and parameters
   * @param {string} contentspace -
   * @param {string} articleIdOrSlug -
   */
  putArticleStats(contentspace, articleIdOrSlug, parameters = {}) {
    let path = '/public/{contentspace}/articlestats/{article_idOrSlug}';
    let body = {};
    let queryParameters = {};
    let headers = {};
    let form = {};

    headers['Accept'] = ['application/json'];
    headers['Content-Type'] = ['application/json'];

    path = path.replace('{contentspace}', contentspace);

    path = path.replace('{article_idOrSlug}', articleIdOrSlug);

    queryParameters = this.mergeQueryParams(parameters, queryParameters);

    return this.request(
      'PUT',
      `${this.baseUrl}${path}`,
      body,
      headers,
      queryParameters,
      form,
    );
  }

  /**
   * Fetch Public Section By Id or Slug
   * @method
   * @param {object} parameters - method options and parameters
   * @param {string} contentspace -
   * @param {string} sectionIdOrUniqId -
   */
  getPublicSectionByIdOrUniqId(
    contentspace,
    sectionIdOrUniqId,
    parameters = {},
  ) {
    let path = '/public/{contentspace}/sections/{section_idOrUniqId}';
    let body = {};
    let queryParameters = {};
    let headers = {};
    let form = {};

    headers = Object.assign({}, headers, this.setAuthHeaders(headers));
    headers['Accept'] = ['application/json'];
    headers['Content-Type'] = ['application/json'];

    path = path.replace('{contentspace}', contentspace);

    path = path.replace('{section_idOrUniqId}', sectionIdOrUniqId);

    queryParameters = this.mergeQueryParams(parameters, queryParameters);

    return this.request(
      'GET',
      `${this.baseUrl}${path}`,
      body,
      headers,
      queryParameters,
      form,
    );
  }

  /**
   * Fetch Public Sections Tree
   * @method
   * @param {object} parameters - method options and parameters
   * @param {string} contentspace -
   */
  getPublicSectionsTree(contentspace, parameters = {}) {
    let path = '/public/{contentspace}/sections-tree';
    let body = {};
    let queryParameters = {};
    let headers = {};
    let form = {};

    headers['Accept'] = ['application/json'];
    headers['Content-Type'] = ['application/json'];

    path = path.replace('{contentspace}', contentspace);

    queryParameters = this.mergeQueryParams(parameters, queryParameters);

    return this.request(
      'GET',
      `${this.baseUrl}${path}`,
      body,
      headers,
      queryParameters,
      form,
    );
  }

  /**
   * Fetch Public Section Tree By Id or Uniqid
   * @method
   * @param {object} parameters - method options and parameters
   * @param {string} contentspace -
   * @param {string} sectionIdOrUniqId -
   */
  getPublicSectionTreeByIdOrUniqId(
    contentspace,
    sectionIdOrUniqId,
    parameters = {},
  ) {
    let path = '/public/{contentspace}/sections/{section_idOrUniqId}/tree';
    let body = {};
    let queryParameters = {};
    let headers = {};
    let form = {};

    headers['Accept'] = ['application/json'];
    headers['Content-Type'] = ['application/json'];

    path = path.replace('{contentspace}', contentspace);

    path = path.replace('{section_idOrUniqId}', sectionIdOrUniqId);

    queryParameters = this.mergeQueryParams(parameters, queryParameters);

    return this.request(
      'GET',
      `${this.baseUrl}${path}`,
      body,
      headers,
      queryParameters,
      form,
    );
  }

  /**
   * Fetch Public Subsections By Id
   * @method
   * @param {object} parameters - method options and parameters
   * @param {string} contentspace -
   * @param {string} sectionIdOrUniqId -
   * @param {number} parameters.treelevel -
   */
  getPublicSubsectionsByIdOrUniqId(
    contentspace,
    sectionIdOrUniqId,
    parameters = {},
  ) {
    let path = '/public/{contentspace}/sections/{section_idOrUniqId}/sections';
    let body = {};
    let queryParameters = {};
    let headers = {};
    let form = {};

    headers['Accept'] = ['application/json'];
    headers['Content-Type'] = ['application/json'];

    path = path.replace('{contentspace}', contentspace);

    path = path.replace('{section_idOrUniqId}', sectionIdOrUniqId);

    if (parameters['treelevel'] !== undefined) {
      queryParameters['treelevel'] = parameters['treelevel'];
    }

    queryParameters = this.mergeQueryParams(parameters, queryParameters);

    return this.request(
      'GET',
      `${this.baseUrl}${path}`,
      body,
      headers,
      queryParameters,
      form,
    );
  }

  /**
   * Fetch Public Articles By Section Id
   * @method
   * @param {object} parameters - method options and parameters
   * @param {number} parameters.offset -
   * @param {number} parameters.limit -
   * @param {number} parameters.excludeId -
   * @param {array} parameters.widgets -
   * @param {array} parameters.widgetsType -
   * @param {string} contentspace -
   * @param {integer} sectionId -
   */
  getPublicArticlesBySectionId(contentspace, sectionId, parameters = {}) {
    let path = '/public/{contentspace}/sections/{section_id}/articles';
    let body = {};
    let queryParameters = {};
    let headers = {};
    let form = {};

    headers['Accept'] = ['application/json'];
    headers['Content-Type'] = ['application/json'];

    if (parameters['offset'] !== undefined) {
      queryParameters['offset'] = parameters['offset'];
    }

    /** set default value **/
    queryParameters['limit'] = '50';

    if (parameters['limit'] !== undefined) {
      queryParameters['limit'] = parameters['limit'];
    }

    if (parameters['excludeId'] !== undefined) {
      queryParameters['exclude_id'] = parameters['excludeId'];
    }

    if (parameters['widgets'] !== undefined) {
      queryParameters['widgets'] = parameters['widgets'];
    }

    if (parameters['widgetsType'] !== undefined) {
      queryParameters['widgets_type'] = parameters['widgetsType'];
    }

    path = path.replace('{contentspace}', contentspace);

    path = path.replace('{section_id}', sectionId);

    queryParameters = this.mergeQueryParams(parameters, queryParameters);

    return this.request(
      'GET',
      `${this.baseUrl}${path}`,
      body,
      headers,
      queryParameters,
      form,
    );
  }

  /**
   * Fetch Section Path By Section Id
   * @method
   * @param {object} parameters - method options and parameters
   * @param {string} contentspace -
   * @param {integer} sectionId -
   */
  getPathForSectionId(contentspace, sectionId, parameters = {}) {
    let path = '/public/{contentspace}/sections/{section_id}/path';
    let body = {};
    let queryParameters = {};
    let headers = {};
    let form = {};

    headers['Accept'] = ['application/json'];
    headers['Content-Type'] = ['application/json'];

    path = path.replace('{contentspace}', contentspace);

    path = path.replace('{section_id}', sectionId);

    queryParameters = this.mergeQueryParams(parameters, queryParameters);

    return this.request(
      'GET',
      `${this.baseUrl}${path}`,
      body,
      headers,
      queryParameters,
      form,
    );
  }

  /**
   * Fetch Static Content By Id
   * @method
   * @param {object} parameters - method options and parameters
   * @param {string} contentspace -
   * @param {string} cid -
   */
  getPublicStaticContentById(contentspace, cid, parameters = {}) {
    let path = '/public/{contentspace}/static-content/{cid}';
    let body = {};
    let queryParameters = {};
    let headers = {};
    let form = {};

    headers['Accept'] = ['application/json'];
    headers['Content-Type'] = ['application/json'];

    path = path.replace('{contentspace}', contentspace);

    path = path.replace('{cid}', cid);

    queryParameters = this.mergeQueryParams(parameters, queryParameters);

    return this.request(
      'GET',
      `${this.baseUrl}${path}`,
      body,
      headers,
      queryParameters,
      form,
    );
  }

  /**
   * Fetch Static Content By Id
   * @method
   * @param {object} parameters - method options and parameters
   * @param {string} contentspace -
   * @param {string} cid -
   */
  getPublicStaticContentById_1(contentspace, cid, parameters = {}) {
    let path = '/public/{contentspace}/static_content/{cid}';
    let body = {};
    let queryParameters = {};
    let headers = {};
    let form = {};

    headers['Accept'] = ['application/json'];
    headers['Content-Type'] = ['application/json'];

    path = path.replace('{contentspace}', contentspace);

    path = path.replace('{cid}', cid);

    queryParameters = this.mergeQueryParams(parameters, queryParameters);

    return this.request(
      'GET',
      `${this.baseUrl}${path}`,
      body,
      headers,
      queryParameters,
      form,
    );
  }

  /**
   * Gets information from livestream url. Main purpose is for fetching video details and then later embeding it in iframe.
   * @method
   * @param {object} parameters - method options and parameters
   * @param {string} parameters.url -
   */
  parseLivestreamUrl(parameters = {}) {
    let path = '/public/parse-livestream-url';
    let body = {};
    let queryParameters = {};
    let headers = {};
    let form = {};

    headers['Accept'] = ['application/json'];
    headers['Content-Type'] = ['application/json'];

    if (parameters['url'] !== undefined) {
      queryParameters['url'] = parameters['url'];
    }

    if (parameters['url'] === undefined) {
      throw Error('Missing required  parameter: url');
    }

    queryParameters = this.mergeQueryParams(parameters, queryParameters);

    return this.request(
      'GET',
      `${this.baseUrl}${path}`,
      body,
      headers,
      queryParameters,
      form,
    );
  }
}

export default new ApiCSM();
