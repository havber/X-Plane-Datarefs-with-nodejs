const PORT = 49000;
const HOST = '127.0.0.1';
const FREQ = 2;

const dgram = require('dgram');
const client = dgram.createSocket('udp4');

const createMessage = (dref, idx, freq) => {

    // A dataref request should be 413 bytes long
    // {
    //      label: null terminated 4 chars (5 bytes)
    //      frequency: int (4 bytes)
    //      index: int (4 bytes)
    //      name. char (400 bytes)
    // }

    const message = Buffer.alloc(413);

    // Label that tells X Plane that we are asking for datarefs
    message.write('RREF\0');

    // Frequency that we want X Plane to send the data (timer per sedond)
    message.writeInt8(freq, 5);

    // Index: X Plane will respond with this index to let you know what message it is responding to
    message.writeInt8(idx, 9);

    // This is the dataref you are asking for
    message.write(dref, 13);

    return message;
};

const messages = [
    // 'sim/name/of/dataref', index, frequency'
    createMessage('sim/flightmodel/position/latitude', 1, FREQ),
    createMessage('sim/flightmodel/position/longitude', 1, FREQ),
    createMessage('sim/flightmodel/position/mag_psi', 1, FREQ),
];

client.on('listening', () => {
    const address = client.address();
    console.log(`UDP client listening on ${address.address}:${address.port}`);
});

client.on('message', (message, remote) => {

    // Message structure received from X Plane:
    // {
    //      label: 4 bytes,
    //      1 byte (for internal use by X Plane)
    //      index: 4 bytes
    //      value: float - 8 bytes x n
    // }


    // Read the first 4 bytes. This is the label that x-plane responds with to indicate
    // what type of data you are receiving. In our case, this should be "RREF". If it is
    // not, ignore the message.
    // The next byte (offset 4) is used by x plane, and not of interest
    // The index (at offset 5) is the index that you specified in the message. To specify
    // which request X Plane is responding to
    // The values starts at offset 9. 8 bytes per value. Values will appear in the same order
    // as the requested values 
    const label = message.readInt8(0).toString();
    if (label !== 'RREF') {
        console.log('Unknown package. Ignoring');
    } else {
        let offset = 9;
        let messages = [];

        // RREFs values are floats. They occupy 8 bytes. On message can contain sveral values,
        // depending on how many you asked for. Read every value by iterating over message and
        // increasing the offset by 8.
        while (offset < message.length - 9) {
            messages = messages.push(message.readFloatLE(offset));
            offset += 8;
        }
    }
});

for (let i = 0; i < messages.length; i++) {
    client.send(messages[i], 0, messages[i].length, PORT, HOST, (err, bytes) => {
        if (err) {
            console.log('Error', err)
        } else {
            console.log(`UDP message sent to ${HOST}:${PORT}`);
        }
    });
}

