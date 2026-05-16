import JSEncrypt from 'jsencrypt/bin/jsencrypt.min';

// 密钥对生成 http://web.chacuo.net/netrsakeypair

// const publicKey = 'MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAKoR8mX0rGKLqzcWmOzbfj64K8ZIgOdH\n' +
//   'nzkXSOVOZbFu/TJhZ7rFAN+eaGkl3C4buccQd/EjEsj9ir7ijT7h96MCAwEAAQ=='

const publicKey = 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCPqwWQEQqXfPxa3GFUvNR+1rkMXmLSlXZqeBEYrXqjCxVp+cdKIDPOKjiapW06RSuGEBWQuKwNyG1IpDRLddifZJ0TZQEd3BNkaIqfUz4RE+qhnIb48dcJQwQdiwvTfrkLCky67aczhRt8kwcOvG0dK68QVI2xKowT4BMGkowfAwIDAQAB'

// 加密
export function encrypt(txt) {
  const encryptor = new JSEncrypt();
  encryptor.setPublicKey(publicKey); // 设置公钥
  return encryptor.encrypt(txt); // 对数据进行加密
}
