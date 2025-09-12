import { createClient } from 'redis';

export const client = createClient({
    username: 'default',
    password: 'HERnCEc4lk1FncTuwAVbTbCvgZaC0sH8',
    socket: {
        host: 'redis-12990.c9.us-east-1-2.ec2.redns.redis-cloud.com',
        port: 12990
    }
});



