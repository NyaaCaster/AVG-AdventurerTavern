/**
 * 鍚庣鏈嶅姟閰嶇疆鏂囦欢
 */
const path = require('path');
const fs = require('fs');

module.exports = {
    // 鍚庣鏈嶅姟鐩戝惉绔彛
    PORT: 3097,

    // HTTPS 閰嶇疆
    HTTPS_ENABLED: true,
    SSL_KEY_PATH: path.join(__dirname, 'SSL', 'h.hony-wen.com.key'),
    SSL_CERT_PATH: path.join(__dirname, 'SSL', 'h.hony-wen.com_bundle.crt'),

    // 鏁版嵁搴撴枃浠跺瓨鏀捐矾寰?(浣跨敤鏁版嵁鍗蜂互鎸佷箙鍖?
    DB_PATH: '/app/data/database.sqlite',

    // CORS (璺ㄥ煙璧勬簮鍏变韩) 閰嶇疆
    CORS_CONFIG: {
        origin: true, // 鍏佽鎵€鏈夋潵婧?(寮€鍙戠幆澧?锛岀敓浜х幆澧冨缓璁涓哄叿浣撳煙鍚?        credentials: true,
        methods: ['GET', 'POST', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization']
    }
};

