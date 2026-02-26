import { getPostSignature } from '../api/post';

export const uploadFile = async (
  filePath: string,
  filename?: string,
): Promise<[Error] | [null, string]> => {
  const [err, signatureData] = await getPostSignature();
  if (err) return [err];

  return new Promise((resolve) => {
    uni.uploadFile({
      url: signatureData.host,
      filePath: filePath,
      name: 'file',
      formData: {
        policy: signatureData.policy,
        signature: signatureData.signature,
        OSSAccessKeyId: signatureData.OSSAccessKeyId,
        key: `${signatureData.dir}${filename}`,
      },
      success: (res) => {
        if (res.statusCode === 204 || res.statusCode === 200) {
          const fileUrl = `${signatureData.host}/${signatureData.dir}${filename}`;
          resolve([null, fileUrl]);
        } else {
          resolve([new Error(`上传失败，状态码：${res.statusCode}`)]);
        }
      },
      fail: (err) => {
        resolve([new Error(err.errMsg)]);
      },
    });
  });
};
