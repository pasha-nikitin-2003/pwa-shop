/// <reference lib="WebWorker" />

export type {}
declare const self: ServiceWorkerGlobalScope

self.addEventListener('install', function () {
  console.log('install')
  self.skipWaiting()
})

self.addEventListener('activate', function () {
  console.log('activate')
})
