import { Config, Connect, ConnectEvents, MiniApp } from '@vkontakte/superappkit'

navigator.serviceWorker.register('/service-worker.js', {
  scope: '/',
})

Config.init({
  appId: 51718541,
})

async function miniAppOpen(silentToken: string, uuid: string) {
  const res = await fetch('http://localhost:4000/generate-superapp-token', {
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
  const jsonRes = await res.json()
  Config.setSuperAppToken(jsonRes.superAppToken)
  console.log(jsonRes.superAppToken)

  const miniapp = new MiniApp({
    app: 51654068,
  })
  miniapp.open()
}

const oneTapButton = Connect.buttonOneTapAuth({
  // Обязательный параметр в который нужно добавить обработчик событий приходящих из SDK
  callback: function (e) {
    const type = e.type

    if (!type) {
      return false
    }

    switch (type) {
      case ConnectEvents.OneTapAuthEventsSDK.LOGIN_SUCCESS: // = 'VKSDKOneTapAuthLoginSuccess'
        console.log(e.payload)
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore: Unreachable code error
        if (e.payload) miniAppOpen(e.payload.token, e.payload.uuid)
        return false
    }

    return false
  },
  // Не обязательный параметр с настройками отображения OneTap
  options: {
    showAlternativeLogin: true, // Отображение кнопки "Войти другим способом"
    displayMode: 'default', // Режим отображения кнопки 'default' | 'name_phone' | 'phone_name'
    buttonStyles: {
      borderRadius: 8, // Радиус скругления кнопок
    },
  },
})

// Получить iframe можно с помощью метода getFrame()
if (oneTapButton) document.body.appendChild(oneTapButton.getFrame() as Node)
