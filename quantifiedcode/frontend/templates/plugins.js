define('plugins', [{{plugin_modules}}],
  function () {
      return {{plugins|tojson|safe}};
});
