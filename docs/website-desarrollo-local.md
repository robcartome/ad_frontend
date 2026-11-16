# Website local con PostgreSQL aislado

`localhost:3000` no es un dominio Website válido en Django. En desarrollo, Next puede consultar un dominio registrado explícitamente mediante `WEBSITE_DEV_HOSTNAME`. La opción solo se aplica con `NODE_ENV=development`, Host `localhost` y un hostname válido; con `next start`, otros hosts o sin configuración se conserva la resolución habitual. Django continúa exigiendo dominio activo y verificado, empresa activa y revisión publicada.

Los siguientes comandos PowerShell preparan una instancia desechable independiente. No apuntan a la base habitual. El directorio indicado debe estar vacío y el puerto 55439 libre. Ajusta la ruta de PostgreSQL si está instalado en otro lugar.

```powershell
$pgBin = 'C:\Program Files\PostgreSQL\18\bin'
$pgData = 'D:\Proyectos\ApuDig\.tools\website-dev-pg'
& "$pgBin\initdb.exe" -D $pgData -U apudig_b3 --auth=trust --encoding=UTF8 --locale=C
& "$pgBin\pg_ctl.exe" start -D $pgData -l 'D:\Proyectos\ApuDig\.tools\website-dev-pg.log' -o '-h 127.0.0.1 -p 55439' -w
& "$pgBin\createdb.exe" -h 127.0.0.1 -p 55439 -U apudig_b3 apudig_b3_integration
```

La autenticación trust es para esta instancia local con datos sintéticos. En otra terminal, configura Django antes de ejecutar cualquier comando de base:

```powershell
cd D:\Proyectos\ApuDig\apudig_mvp
$env:DJANGO_SETTINGS_MODULE='config.settings'
$env:DJANGO_DB_ENGINE='django.db.backends.postgresql'
$env:DJANGO_DB_NAME='apudig_b3_integration'
$env:DJANGO_DB_HOST='127.0.0.1'
$env:DJANGO_DB_PORT='55439'
$env:DJANGO_DB_USER='apudig_b3'
$env:DJANGO_DB_PASSWORD=''
$env:JWT_SECRET_KEY='website-local-only-secret-at-least-32-characters'
$env:CORS_ALLOWED_ORIGINS='http://localhost:3000'
.\.venv\Scripts\python.exe manage.py showmigrations websites
.\.venv\Scripts\python.exe manage.py migrate --plan
.\.venv\Scripts\python.exe manage.py migrate --noinput
.\.venv\Scripts\python.exe apps\websites\tests\provision_integration.py
.\.venv\Scripts\python.exe manage.py runserver 127.0.0.1:8013
```

El script existente está restringido a `apudig_b3_integration` en el puerto 55439. Crea dos empresas sintéticas, dominios y usuarios de prueba; **no publica contenido**. El usuario A es `b3-a@example.test` y su contraseña temporal de la instancia desechable es `Integration-B3-only-2026`.

En otra terminal, inicia Next con las URLs y el hostname explícitos:

```powershell
cd D:\Proyectos\ApuDig\ad_frontend
$env:NEXT_PUBLIC_API_V1_URL='http://127.0.0.1:8013/api/v1'
$env:WEBSITE_API_V1_URL='http://127.0.0.1:8013/api/v1'
$env:WEBSITE_DEV_HOSTNAME='a.b3.localhost'
npm.cmd run dev -- --port 3000
```

Inicia sesión en `http://localhost:3000/login`, selecciona la empresa A y entra a `/admin/website`. Modifica y guarda el borrador y luego pulsa **Publicar revisión**. Entonces abre `http://localhost:3000/`. Hasta publicar, o si el hostname configurado no corresponde a un dominio activo y verificado, la respuesta seguirá siendo 404. Reinicia Next después de cambiar variables. El backend debe permanecer encendido.

Las imágenes requieren R2 autorizado; la publicación de texto puede probarse sin subir imágenes. La instancia de ejemplo no verifica DNS real ni prueba R2/CDN. Para detener PostgreSQL usa `& "$pgBin\pg_ctl.exe" stop -D $pgData -m fast -w` en una terminal que conserve esas variables. Elimina la instancia únicamente cuando ya no necesites sus datos de prueba.
