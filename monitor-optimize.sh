#!/bin/bash

# 容器监控和优化脚本
# 使用方法: ./monitor-optimize.sh [--stats] [--logs] [--optimize] [--clean]

set -e

CONTAINER_NAME="adventurertavern"
NETWORK_NAME="avg-adventurertavern_app-network"

# 显示帮助
show_help() {
    echo "容器监控和优化脚本"
    echo "使用方法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  --stats      显示容器资源使用统计"
    echo "  --logs       显示容器日志"
    echo "  --optimize   运行优化任务"
    echo "  --clean      清理无用资源"
    echo "  --health     检查容器健康状态"
    echo "  --perf       运行性能测试"
    echo "  --all        运行所有检查"
    echo "  --help       显示此帮助信息"
    echo ""
}

# 检查容器是否存在
check_container() {
    if ! docker ps -a --format "{{.Names}}" | grep -q "^${CONTAINER_NAME}$"; then
        echo "❌ 容器 '$CONTAINER_NAME' 不存在"
        return 1
    fi
    return 0
}

# 显示容器统计信息
show_stats() {
    echo "📊 容器资源使用统计:"
    echo "======================"
    
    # 容器状态
    echo "🔍 容器状态:"
    docker ps -a --filter "name=${CONTAINER_NAME}" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    echo ""
    
    # 资源使用
    echo "💾 资源使用:"
    docker stats "${CONTAINER_NAME}" --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}\t{{.NetIO}}\t{{.BlockIO}}"
    echo ""
    
    # 进程信息
    echo "🔄 进程信息:"
    docker top "${CONTAINER_NAME}"
    echo ""
}

# 显示容器日志
show_logs() {
    echo "📝 容器日志 (最后50行):"
    echo "======================"
    docker logs "${CONTAINER_NAME}" --tail 50 --timestamps
    echo ""
    
    # Nginx访问日志
    echo "🌐 Nginx访问日志 (最后20行):"
    docker exec "${CONTAINER_NAME}" tail -20 /var/log/nginx/access.log 2>/dev/null || echo "无法访问访问日志"
    echo ""
    
    # Nginx错误日志
    echo "⚠️  Nginx错误日志 (最后20行):"
    docker exec "${CONTAINER_NAME}" tail -20 /var/log/nginx/error.log 2>/dev/null || echo "无法访问错误日志"
    echo ""
}

# 运行优化任务
run_optimization() {
    echo "⚡ 运行优化任务..."
    echo "======================"
    
    # 1. 清理Nginx缓存
    echo "1. 清理Nginx缓存..."
    docker exec "${CONTAINER_NAME}" sh -c "rm -rf /var/cache/nginx/*" 2>/dev/null && echo "✅ Nginx缓存已清理"
    
    # 2. 重新加载Nginx配置
    echo "2. 重新加载Nginx配置..."
    docker exec "${CONTAINER_NAME}" nginx -t 2>/dev/null && \
    docker exec "${CONTAINER_NAME}" nginx -s reload 2>/dev/null && \
    echo "✅ Nginx配置已重新加载"
    
    # 3. 检查文件权限
    echo "3. 检查文件权限..."
    docker exec "${CONTAINER_NAME}" sh -c "ls -la /usr/share/nginx/html/" | head -5
    echo "✅ 文件权限检查完成"
    
    # 4. 检查健康状态
    echo "4. 检查健康状态..."
    HEALTH_CHECK=$(docker inspect --format='{{.State.Health.Status}}' "${CONTAINER_NAME}" 2>/dev/null || echo "unknown")
    echo "健康状态: $HEALTH_CHECK"
    
    echo ""
    echo "✅ 优化任务完成"
}

# 清理无用资源
clean_resources() {
    echo "🧹 清理无用资源..."
    echo "======================"
    
    # 停止并删除容器
    echo "1. 停止容器..."
    docker-compose down 2>/dev/null || true
    
    # 清理未使用的镜像
    echo "2. 清理未使用的镜像..."
    docker image prune -af 2>/dev/null || true
    
    # 清理构建缓存
    echo "3. 清理构建缓存..."
    docker builder prune -af 2>/dev/null || true
    
    # 清理未使用的卷
    echo "4. 清理未使用的卷..."
    docker volume prune -f 2>/dev/null || true
    
    # 清理未使用的网络
    echo "5. 清理未使用的网络..."
    docker network prune -f 2>/dev/null || true
    
    echo ""
    echo "✅ 资源清理完成"
    echo ""
    echo "📋 建议下一步:"
    echo "   重新构建并启动: docker-compose up -d --build"
}

# 检查健康状态
check_health() {
    echo "🏥 健康检查..."
    echo "======================"
    
    # 容器健康状态
    HEALTH_STATUS=$(docker inspect --format='{{.State.Health.Status}}' "${CONTAINER_NAME}" 2>/dev/null || echo "unknown")
    echo "容器健康状态: $HEALTH_STATUS"
    
    # 内部健康检查
    echo "内部健康检查端点:"
    curl -s -o /dev/null -w "HTTP状态码: %{http_code}\n" http://localhost:3098/health || echo "无法访问健康检查端点"
    
    # Nginx状态
    echo "Nginx状态检查:"
    docker exec "${CONTAINER_NAME}" nginx -t 2>/dev/null && echo "✅ Nginx配置有效" || echo "❌ Nginx配置错误"
    
    # 端口检查
    echo "端口检查 (3098):"
    nc -z localhost 3098 2>/dev/null && echo "✅ 端口3098可访问" || echo "❌ 端口3098不可访问"
    
    echo ""
}

# 运行性能测试
run_performance_test() {
    echo "⚡ 性能测试..."
    echo "======================"
    
    # 检查响应时间
    echo "1. 响应时间测试:"
    for i in {1..3}; do
        START_TIME=$(date +%s%N)
        curl -s -o /dev/null http://localhost:3098/
        END_TIME=$(date +%s%N)
        RESPONSE_TIME=$(( (END_TIME - START_TIME) / 1000000 ))
        echo "   请求 $i: ${RESPONSE_TIME}ms"
    done
    
    # 检查静态资源加载
    echo "2. 静态资源检查:"
    STATIC_FILES=("/" "/assets/index-aZX2KrLF.js" "/index.html")
    for file in "${STATIC_FILES[@]}"; do
        STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3098${file}")
        if [ "$STATUS" = "200" ] || [ "$STATUS" = "304" ]; then
            echo "   ✅ $file: HTTP $STATUS"
        else
            echo "   ❌ $file: HTTP $STATUS"
        fi
    done
    
    # 检查缓存头
    echo "3. 缓存头检查:"
    CACHE_HEADERS=$(curl -s -I "http://localhost:3098/assets/index-aZX2KrLF.js" | grep -i "cache-control\|expires")
    echo "   缓存头: $CACHE_HEADERS"
    
    echo ""
}

# 运行所有检查
run_all_checks() {
    echo "🔍 运行全面检查..."
    echo "======================"
    echo ""
    
    check_container || exit 1
    
    show_stats
    show_logs
    check_health
    run_performance_test
    
    echo "📋 检查完成!"
    echo ""
    echo "💡 建议:"
    echo "   1. 如果CPU使用率 > 80%，考虑升级服务器配置"
    echo "   2. 如果内存使用率 > 85%，考虑增加内存"
    echo "   3. 如果响应时间 > 500ms，考虑优化Nginx配置"
    echo "   4. 定期运行 './monitor-optimize.sh --optimize' 进行维护"
}

# 主函数
main() {
    if [ $# -eq 0 ]; then
        show_help
        exit 0
    fi
    
    case "$1" in
        --stats)
            check_container || exit 1
            show_stats
            ;;
        --logs)
            check_container || exit 1
            show_logs
            ;;
        --optimize)
            check_container || exit 1
            run_optimization
            ;;
        --clean)
            clean_resources
            ;;
        --health)
            check_container || exit 1
            check_health
            ;;
        --perf)
            check_container || exit 1
            run_performance_test
            ;;
        --all)
            check_container || exit 1
            run_all_checks
            ;;
        --help)
            show_help
            ;;
        *)
            echo "未知选项: $1"
            show_help
            exit 1
            ;;
    esac
}

# 运行主函数
main "$@"