pm2 stop all;
pm2 flush;
pm2 delete all;
brew services run redis;
brew services run postgresql;
psql postgres -c "drop database spokedev"
psql postgres -c "create database spokedev"
rm -r ./build;
OUTPUT_DIR=./build yarn run prod-build-server &&
ASSETS_DIR=./build/client/assets ASSETS_MAP_FILE=assets.json NODE_ENV=production yarn prod-build-client &&
echo "DONE" &&
./run.sh
afplay /System/Library/Sounds/Funk.aiff 
