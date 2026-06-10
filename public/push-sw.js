self.addEventListener('push', function(event) {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch (error) {
    console.error('[push-sw] Failed to parse push payload:', error);
    payload = {};
  }
  const title = payload.title || 'Amiverse 🔕';

  const defaultOptions = {
    body: '新しい通知があります',
    icon: '/static-assets/images/amiverse-logo-400.webp',
    image: '/static-assets/images/amiverse-1.webp',
    badge: '/static-assets/images/amiverse-logo-alpha-400.png',
    timestamp: Date.now(),
    tag: 'new-notification',
    renotify: true,
    data: {
      url: '/notifications'
    },
    actions: [
      {
        action: 'visit_top',
        title: 'トップへ'
      },
      {
        action: 'open_notifications',
        icon: '/static-assets/images/amiverse-logo-alpha-400.png',
        title: '通知一覧へ'
      }
    ]
  };

  const options = {
    ...defaultOptions,
    ...payload.options,
    data: {
      ...defaultOptions.data,
      ...(payload.options?.data || {})
    }
  }

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  const notificationData = event.notification.data || {};
  let targetUrl = notificationData.url || '/';
  const actionUrls = notificationData.action_urls || {};

  if (event.action && actionUrls[event.action]) {
    targetUrl = actionUrls[event.action];
  } else if (event.action === 'open_notifications') {
    targetUrl = '/notifications';
  } else if (event.action === 'visit_top') {
    targetUrl = '/';
  } else if (event.action === 'open_settings') {
    targetUrl = '/settings';
  }

  const urlToOpen = new URL(targetUrl, self.location.origin).href;

  event.waitUntil(
    // 既存のウィンドウを探してフォーカスする仕様は、入力中のデータを失う可能性があるため一時的に無効化
    /*
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let client of windowClients) {
        if (client.url.startsWith(self.location.origin) && 'focus' in client) {
          return client.focus().then(() => client.navigate(urlToOpen));
        }
      }
      return clients.openWindow(urlToOpen);
    })
    */
    clients.openWindow(urlToOpen)
  );
});
