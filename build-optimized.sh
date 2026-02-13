#!/bin/bash

# 优化构建脚本 for AdventurerTavern
# 使用方法: ./build-optimized.sh [--prod] [--push] [--tag TAG]

set -e

# 默认值
BUILD_TYPE="development"
PUSH_IMAGE=false
IMAGE_TAG="latest"
DOCKER_REGISTRY=""
IMAGE_NAME="adventurertavern"

# 解析参数
while [[ $# -gt 0 ]]; do
    case $1 in
        --prod)
            BUILD_TYPE="production"
            shift
            ;;
        --push)
            PUSH_IMAGE=true
            shift
            ;;
        --tag)
            IMAGE_TAG="$2"
            shift 2
            ;;
        --registry)
            DOCKER_REGISTRY="$2"
            shift 2
            ;;
        --name)
            IMAGE_NAME="$2"
            shift 2
            ;;
        *)
            echo "未知参数: $1"
            echo "使用方法: $0 [--prod] [--push] [--tag TAG] [--registry REGISTRY] [--name NAME]"
            exit 1
            ;;
    esac
done

# 设置构建参数
BUILD_ARGS=""
if [ "$BUILD_TYPE" = "production" ]; then
    BUILD_ARGS="--build-arg NODE_ENV=production --build-arg NPM_CONFIG_LOGLEVEL=warn"
    echo "🔨 生产环境构建..."
else
    echo "🔨 开发环境构建..."
fi

# 完整的镜像标签
if [ -n "$DOCKER_REGISTRY" ]; then
    FULL_IMAGE_NAME="${DOCKER_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"
else
    FULL_IMAGE_NAME="${IMAGE_NAME}:${IMAGE_TAG}"
fi

echo "📦 镜像名称: $FULL_IMAGE_NAME"
echo "⚙️  构建参数: $BUILD_ARGS"

# 清理旧的构建缓存
echo "🧹 清理构建缓存..."
docker builder prune -f

# 构建镜像
echo "🚀 开始构建Docker镜像..."
docker build \
    $BUILD_ARGS \
    --tag "$FULL_IMAGE_NAME" \
    --file Dockerfile \
    --progress=plain \
    --no-cache \
    .

# 检查构建结果
if [ $? -eq 0 ]; then
    echo "✅ 镜像构建成功: $FULL_IMAGE_NAME"
    
    # 显示镜像信息
    echo "📊 镜像信息:"
    docker images "$FULL_IMAGE_NAME" --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"
    
    # 显示镜像层信息
    echo "📋 镜像层信息:"
    docker history "$FULL_IMAGE_NAME" --format "table {{.CreatedBy}}\t{{.Size}}" --no-trunc | head -20
    
    # 显示镜像大小
    IMAGE_SIZE=$(docker images "$FULL_IMAGE_NAME" --format "{{.Size}}")
    echo "📏 最终镜像大小: $IMAGE_SIZE"
    
    # 如果启用了推送，推送到仓库
    if [ "$PUSH_IMAGE" = true ]; then
        if [ -n "$DOCKER_REGISTRY" ]; then
            echo "🚚 推送镜像到 $DOCKER_REGISTRY..."
            docker push "$FULL_IMAGE_NAME"
            
            if [ $? -eq 0 ]; then
                echo "✅ 镜像推送成功"
            else
                echo "❌ 镜像推送失败"
                exit 1
            fi
        else
            echo "⚠️  未指定镜像仓库，跳过推送"
        fi
    fi
    
    # 运行健康检查
    echo "🏥 运行容器健康检查..."
    docker run --rm -d --name test-healthcheck -p 8080:80 "$FULL_IMAGE_NAME" > /dev/null 2>&1
    
    sleep 5
    
    # 检查健康状态
    HEALTH_STATUS=$(docker inspect --format='{{.State.Health.Status}}' test-healthcheck 2>/dev/null || echo "unknown")
    
    if [ "$HEALTH_STATUS" = "healthy" ]; then
        echo "✅ 容器健康检查通过"
    else
        echo "⚠️  容器健康状态: $HEALTH_STATUS"
    fi
    
    # 停止测试容器
    docker stop test-healthcheck > /dev/null 2>&1
    docker rm test-healthcheck > /dev/null 2>&1
    
    # 性能测试
    echo "⚡ 运行简单性能测试..."
    docker run --rm --name test-perf "$FULL_IMAGE_NAME" nginx -t > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "✅ Nginx配置测试通过"
    else
        echo "❌ Nginx配置测试失败"
    fi
    
    echo ""
    echo "🎉 构建完成!"
    echo "📋 下一步操作:"
    echo "   1. 启动容器: docker-compose up -d"
    echo "   2. 查看日志: docker-compose logs -f"
    echo "   3. 停止容器: docker-compose down"
    echo "   4. 更新镜像: docker-compose pull && docker-compose up -d"
    
else
    echo "❌ 镜像构建失败"
    exit 1
fi