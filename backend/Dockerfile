# 使用官方Node.js 20镜像作为基础
FROM node:20-alpine

# 设置工作目录
WORKDIR /app

# 复制package.json和pnpm-lock.yaml文件
COPY package.json pnpm-lock.yaml ./

# 安装pnpm
RUN npm install -g pnpm

# 设置pnpm镜像源
RUN pnpm config set registry https://registry.npmmirror.com/

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 构建项目
RUN pnpm run build

# 暴露端口
EXPOSE 3000

# 运行项目
CMD ["pnpm", "run", "start:prod"]