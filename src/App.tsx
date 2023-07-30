import { FC, useEffect, useLayoutEffect } from 'react'
import {
  SplitLayout,
  SplitCol,
  View,
  Root,
  usePlatform,
  Platform,
  ScreenSpinner,
} from '@vkontakte/vkui'
import bridge, { SharedUpdateConfigData } from '@vkontakte/vk-bridge'
import {
  useActiveVkuiLocation,
  usePopout,
  useRouteNavigator,
} from '@vkontakte/vk-mini-apps-router'
import { useAppDispatch, useAppSelector } from './store'
import { setOnboardingComplete, setUserData } from './store/user.reducer'
import { Modals } from './modals'
import { Main, Store, ShoppingCart, ProductInfo } from './pages'
import { PaymentPanel, ShopView, ViewingPanel } from './routes'
import { Config, Connect, ConnectEvents } from '@vkontakte/superappkit'
import { fetchShop } from './store/app.reducer'

export const App: FC = () => {
  Config.init({
    appId: 51717708,
  })

  const oneTapButton = Connect.buttonOneTapAuth({
    // Обязательный параметр в который нужно добавить обработчик событий приходящих из SDK
    callback: function (e) {
      const type = e.type

      if (!type) {
        return false
      }

      switch (type) {
        case ConnectEvents.OneTapAuthEventsSDK.LOGIN_SUCCESS: // = 'VKSDKOneTapAuthLoginSuccess'
          console.log(e)
          return false
        // Для этих событий нужно открыть полноценный VK ID чтобы
        // пользователь дорегистрировался или подтвердил телефон
        case ConnectEvents.OneTapAuthEventsSDK.FULL_AUTH_NEEDED: //  = 'VKSDKOneTapAuthFullAuthNeeded'
        case ConnectEvents.OneTapAuthEventsSDK.PHONE_VALIDATION_NEEDED: // = 'VKSDKOneTapAuthPhoneValidationNeeded'
        case ConnectEvents.ButtonOneTapAuthEventsSDK.SHOW_LOGIN: // = 'VKSDKButtonOneTapAuthShowLogin'
          return Connect.redirectAuth({
            url: 'https://...',
            state: 'dj29fnsadjsd82...',
          }) // url - строка с url, на который будет произведён редирект после авторизации.
        // state - состояние вашего приложение или любая произвольная строка, которая будет добавлена к url после авторизации.
        // Пользователь перешел по кнопке "Войти другим способом"
        case ConnectEvents.ButtonOneTapAuthEventsSDK.SHOW_LOGIN_OPTIONS: // = 'VKSDKButtonOneTapAuthShowLoginOptions'
          // Параметр screen: phone позволяет сразу открыть окно ввода телефона в VK ID
          // Параметр url: ссылка для перехода после авторизации. Должен иметь https схему. Обязательный параметр.
          return Connect.redirectAuth({ screen: 'phone', url: 'https://...' })
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
  document.body.appendChild(oneTapButton?.getFrame() as Node)

  //todo __________________

  /** Возвращает активное всплывающее окно | null */
  const routerPopout = usePopout()
  /** возвращает платформу IOS, ANDROID, VKCOM */
  const platform = usePlatform()
  /** возвращает объект с помощью которого можно совершать переходы в навигации */
  const routeNavigator = useRouteNavigator()
  /** Подписываемся на обновлнеие поля shopFetching, отвечающего за состояние загрузки контента магазина */
  const shopFetching = useAppSelector((state) => state.app.shopFetching)

  const {
    view: activeView = ViewingPanel.Main,
    panel: activePanel = ShopView.Viewing,
  } = useActiveVkuiLocation()

  const dispatch = useAppDispatch()
  const id = useAppSelector((state) => state.user.id)
  const onboadrdingComplete = useAppSelector(
    (state) => state.user.onboadrdingComplete
  )

  /** Получение данных пользователя */
  useLayoutEffect(() => {
    async function initUser() {
      // Получаем данные текущего пользователя
      const userData = await bridge.send('VKWebAppGetUserInfo', {})

      // Проверяем есть ли он в Storage
      const data = await bridge.send('VKWebAppStorageGet', {
        keys: [userData.id.toString()],
      })

      // Если он уже сохранен, то сохраняем его имя в store
      if (data.keys[0].value)
        dispatch(setUserData({ name: data.keys[0].value, id: userData.id }))
      // Если не сохранен, то сохраняем в store и показываем приветственную модалку
      else if (userData) {
        dispatch(setUserData({ name: userData.first_name, id: userData.id }))
        dispatch(setOnboardingComplete(false))
        bridge.send('VKWebAppStorageSet', {
          key: userData.id.toString(),
          value: userData.first_name,
        })
      }
    }

    initUser()
  }, [dispatch, routeNavigator])

  /** Растягивание экрана на всю ширину окна для десктопа */
  useEffect(() => {
    /** Callback на изменение размеров страницы */
    async function iframeResize() {
      // Проверяем, что платформа VK.COM
      if (platform !== Platform.VKCOM) return

      // Получаем данные конфигурации
      const data = (await bridge.send(
        'VKWebAppGetConfig'
      )) as SharedUpdateConfigData

      // Обновляем размер страницы
      bridge.send('VKWebAppResizeWindow', {
        width: 911,
        height: data.viewport_height - 100,
      })
    }

    iframeResize()
    window.addEventListener('resize', iframeResize)

    return () => window.removeEventListener('resize', iframeResize)
  }, [platform])

  /** Запрос на получение контента магазина */
  useEffect(() => {
    dispatch(fetchShop({ userId: '10' }))
  }, [dispatch])

  /** Loader на время получения контента магазина */
  useEffect(() => {
    if (shopFetching) routeNavigator.showPopout(<ScreenSpinner size="large" />)
    else routeNavigator.hidePopout()
  }, [shopFetching, routeNavigator])

  /** Открытие модалки при первом заходе в апп */
  useEffect(() => {
    if (!onboadrdingComplete) {
      routeNavigator.showModal('onboarding')
    }
  }, [onboadrdingComplete, routeNavigator])

  /**
   * SplitLayout - Компонент-контейнер для реализации интерфейса с многоколоночной структурой [https://vkcom.github.io/VKUI/#/SplitLayout]
   * SplitCol Компонент-обертка для отрисовки колонки в многоколоночном интерфейсе. [https://vkcom.github.io/VKUI/#/SplitCol]
   * Root - хранилище View [https://vkcom.github.io/VKUI/#/Root]
   * View - хранилище Panel [https://vkcom.github.io/VKUI/#/View]
   * Panel - контент одной страницы [https://vkcom.github.io/VKUI/#/Panel]
   */
  return (
    /**
     * popout - свойство для отрисовки Alert ActionSheet ScreenSpinner
     * modal - свойство для отрисовки модальных страниц(ModalRoot)
     */
    <SplitLayout popout={routerPopout} modal={<Modals />}>
      <SplitCol>
        {/** activeView - активная View */}
        <Root activeView={activeView}>
          {/**
           * nav - путь в навигации
           * activePanel - активная Panel
           */}
          <View nav={ShopView.Viewing} activePanel={activePanel}>
            <Main nav={ViewingPanel.Main} />
            <Store nav={ViewingPanel.Store} />
            <ProductInfo nav={ViewingPanel.ProductInfo} />
          </View>

          <View nav={ShopView.Payment} activePanel={activePanel}>
            <ShoppingCart nav={PaymentPanel.ShoppingCart} />
          </View>
        </Root>
      </SplitCol>
    </SplitLayout>
  )
}
