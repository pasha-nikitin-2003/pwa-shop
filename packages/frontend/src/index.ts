import { Config, Connect, ConnectEvents, MiniApp } from '@vkontakte/superappkit'

const SERVER_DEV_URL = 'http://localhost:4000'

// Регистрация service-worker
navigator.serviceWorker.register('/service-worker.js', {
  scope: '/',
})

Config.init({
  appId: 51718541,
})

/** Функция отркытия popout мини-аппа */
async function miniAppOpen(silentToken: string, uuid: string) {
  const res = await (
    await fetch(`${SERVER_DEV_URL}/generate-superapp-token`, {
      method: 'post',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uuid,
        silentToken,
      }),
    })
  ).json()

  Config.setSuperAppToken(res.superAppToken)
  console.log(res)

  const miniapp = new MiniApp({
    app: 51654068,
  })
  miniapp.open()
}

/** Авторизация по кнопке */
const oneTapButton = Connect.buttonOneTapAuth({
  callback: function (e) {
    const type = e.type

    if (!type) {
      return false
    }

    switch (type) {
      case ConnectEvents.OneTapAuthEventsSDK.LOGIN_SUCCESS:
        console.log(e.payload)
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore: Unreachable code error
        if (e.payload) miniAppOpen(e.payload.token, e.payload.uuid)
        return false
    }
    return false
  },
  options: {
    showAlternativeLogin: true,
    displayMode: 'default',
    buttonStyles: {
      borderRadius: 8,
    },
  },
})

if (oneTapButton) document.body.appendChild(oneTapButton.getFrame() as Node)
