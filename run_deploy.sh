echo 'Iniciando deploy...'

git pull

ng build

if [ -d "public" ]; then
  rm -r public
fi

mkdir public

cp -a dist/app-contas/. public/

firebase deploy