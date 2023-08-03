import app from './app'

const port = process.env.APP_PORT || 4000

app.listen(port, () => {
  console.log(`listening on <http://127.0.0.1>:${port}`)
})
