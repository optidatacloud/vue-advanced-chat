#! /usr/bin/sh

clear
npm run build
rm -rf ../chat/resources/js/chat/vue-advanced-chat/dist/
cp -R dist/ ../chat/resources/js/chat/vue-advanced-chat/
printf "\n\nCompilado em: " && date
