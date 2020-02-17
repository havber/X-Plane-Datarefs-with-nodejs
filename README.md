# x-plane-dref-nodejs
Simple node script to fetch datarefs directly from x-plane, without the need for a plugin

Make sure x-plane is running (change de IP in the script if you are running this from a different machine on the same network as the computer where X Plane is running)

`$ node udp.js`

X Plane will respond with the requested values at you chosen frequency.

See inline comments for explanation about X Plane's data structures and how to read decode the response.

Official list of available datarefs: https://developer.x-plane.com/datarefs/
