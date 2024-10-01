class Controller {
  sendRestAuthentication({ email, password }) {
    return fetch('https://a3c60676f813acc0.mokky.dev/auth', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        password
      })
    })
  }

  sendRestRegistration({ name: fullName, email, password }) {
    return fetch('https://a3c60676f813acc0.mokky.dev/register', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fullName,
        email,
        password
      })
    })
  }

  async setUserData(response) {
    const data = await response.json();
    console.log(data)
  }
}

export const controller = new Controller()
