import { Config, Connect, ConnectEvents, MiniApp } from '@vkontakte/superappkit'

const SERVER_DEV_URL = 'http://localhost:4000'
const isLogin = window.location.href.includes('successLogin')

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
    await fetch(`${SERVER_DEV_URL}/get-superapp-token`, {
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
    if (!type) return false

    switch (type) {
      case ConnectEvents.OneTapAuthEventsSDK.LOGIN_SUCCESS:
        console.log(e.payload)
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore: Unreachable code error
        if (e.payload) miniAppOpen(e.payload.token, e.payload.uuid)
        return false

        // return Connect.redirectAuth({
        //   url: 'http://localhost:80',
        //   state: 'successLogin',
        //   screen: 'phone',
        // })
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

if (oneTapButton && !isLogin)
  document.body.appendChild(oneTapButton.getFrame() as Node)

// Connect.silentAuth().then((res) => {
//   console.log(res)
// }).catch(err => console.log(err))

// Connect.silentAuth().then((res) => {
//   if (!res.payload.token || !res.payload.uuid)
//     throw new Error('Silent auth failed')
// }).catch(() => {
//   const urlParams = new URLSearchParams(window.location.search)
//   const payloadParam = urlParams.get('payload')
//   if (payloadParam) {
//     const payload = JSON.parse(decodeURIComponent(payloadParam))
//     if (payload) miniAppOpen(payload.token, payload.uuid)
//   }
// })
