export class Client {
  /**
   * Должен возвращать имя пользователя или null
   * если пользователь не залогинен
   *
   * @return {Promise<string | null>} username
   * */
  async getUser() {
    const res = await fetch(`api/user`);
    return new Promise((resolve, rejected) => {
      const res = res.text();

      console.log('getUser: ' + res);
      if (res === 'Not Found') {
        rejected();
      }
      else {
        resolve(res);
      }
    });
  }

  /**
   * Должен логинить пользователя с именем username
   * и возвращать его имя
   *
   * @param {string} username
   * @return {Promise<string | null>} username
   * */
  async loginUser(username) {
    await fetch(`api/login?username=${username}`);
    return new Promise((resolve, rejected) => {
      return resolve(username);
    });
  }

  /**
   * Должен разлогинивать текущего пользователя
   *
   * @return {void}
   * */
  async logoutUser() {
    await fetch('api/logout');
  }

  /**
   * Должен возвращать информацию о компании
   *
   * @typedef {Object} Headquarters
   * @property {string} address
   * @property {string} city
   * @property {string} state
   *
   * @typedef {Object} About
   * @property {string} founder
   * @property {string} founded
   * @property {number} employees
   * @property {string} ceo
   * @property {string} coo
   * @property {string} cto
   * @property {number} valuation
   * @property {Headquarters} headquarters
   * @property {string} summary
   * @return {Promise<About>}
   * */
  async getInfo() {
    const response = await fetch("/api/info");
    return new Promise((resolve, rejected) =>
    {
      if (response.ok)
        resolve(response.json());
      else
        rejected();
    });
  }

  /**
   * Должен возвращать информацию о всех событиях
   *
   * @typedef {Object} EventBrief
   * @property {number} id
   * @property {string} title
   *
   * @return {Promise<EventBrief[]>}
   * */
  async getHistory() {
    const response = await fetch("/api/history");
    return new Promise((resolve, rejected) =>
    {
      if (response.ok)
        resolve(response.json());
      else
        rejected();
    });
  }

  /**
   * Должен возвращать информацию о запрошенном событии
   *
   * @typedef {Object} EventFull
   * @property {number} id
   * @property {string} title
   * @property {string} event_date_utc
   * @property {string} details
   * @property {Object.<string, ?string>} links
   *
   * @param {number} id
   * @return {Promise<EventFull>}
   * */
  async getHistoryEvent(id) {
    const response = await fetch(`/api/history/event/?id=${id}`);
    return new Promise((resolve, rejected) =>
    {
      if (response.ok)
        resolve(response.json());
      else
        rejected();
    });
  }

  /**
   * Должен возвращать информацию о всех ракетах
   *
   * @typedef {Object} RocketBrief
   * @property {number} rocket_id
   * @property {string} rocket_name
   *
   * @return {Promise<RocketBrief[]>}
   * */
  async getRockets() {
    const response = await fetch(`/api/rockets`);
    return new Promise((resolve, rejected) =>
    {
      if (response.ok)
        resolve(response.json());
      else
        rejected();
    });
  }

  /**
   * Должен возвращать информацию о запрошенной ракете
   *
   * @typedef {Object} RocketFull
   * @property {number} rocket_id
   * @property {string} rocket_name
   * @property {string} first_flight
   * @property {string} description
   * @property {string} wikipedia
   * @property {string[]} flickr_images
   * Смотри источник данных:
   * @property {Object} height
   * @property {Object} diameter
   * @property {Object} mass
   * @property {Object} engines
   * @property {Object} first_stage
   * @property {Object} second_stage
   *
   * @param {string} id
   * @return {Promise<RocketFull>}
   * */
  async getRocket(id) {
    const response = await fetch(`/api/rockets/rocket/?id=${id}`);
    return new Promise((resolve, rejected) =>
    {
      if (response.ok)
        resolve(response.json());
      else
        rejected();
    });
  }

  /**
   * Должен возвращать информацию о машине в космосе
   *
   * @typedef {Object} Roadster
   * @property {string} name
   * @property {string} launch_date_utc
   * @property {string} details
   * @property {number} earth_distance_km
   * @property {number} mars_distance_km
   * @property {string} wikipedia
   *
   * @return {Promise<Roadster>}
   * */
  async getRoadster() {
    const response = await fetch(`/api/roadster`);
    return new Promise((resolve, rejected) =>
    {
      if (response.ok)
        resolve(response.json());
      else
        rejected();
    });
  }

  /**
   * Должен возвращать информацию о всех посланных на Марс предметах
   *
   * @typedef {Object} Item
   * @property {!string} id
   * @property {!string} name
   * @property {!string} phone
   * @property {?number} weight
   * @property {?string} color
   * @property {?boolean} important
   *
   * @return {Promise<Item[]>}
   * */
  async getSentToMars() {
    const response = await fetch("/api/mars-items");
    return new Promise((resolve, rejected) =>
    {
      if (response.ok)
        resolve(response.json());
      else
        rejected();
    });
  }

  /**
   * Должен посылать на марс переданный предмет и
   * возвращать информацию о всех посланных на Марс предметах
   *
   * @typedef {Object} ItemToSend
   * @property {!string} name
   * @property {!string} phone
   * @property {?number} weight
   * @property {?string} color
   * @property {?boolean} important
   *
   * @param {ItemToSend} item
   * @return {Promise<Item[]>}
   * */
  async sendToMars(item) {
    const response = await fetch("/api/mars-item", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(item),
    });
    return new Promise((resolve, rejected) =>
    {
      if (response.ok)
        resolve(response.json());
      else
        rejected();
    });
  }

  /**
   * Должен отменять отправку на марс переданного предмета и
   * возвращать информацию о всех посланных на Марс предметах
   *
   * @param {Item} item
   * @return {Promise<Item[]>}
   * */
  async cancelSendingToMars(item) {
    const response = await fetch("/api/mars-item", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(item),
    });
    return new Promise((resolve, rejected) =>
    {
      if (response.ok)
        resolve(response.json());
      else
        rejected();
    });
  }
}
