const axios = require('axios');
const config = require('./config');

// Discord API 端点
const DISCORD_API = 'https://discord.com/api/v10';

// 生成 Discord OAuth URL
function getDiscordAuthUrl() {
    const params = new URLSearchParams({
        client_id: config.DISCORD.CLIENT_ID,
        redirect_uri: config.DISCORD.REDIRECT_URI,
        response_type: 'code',
        scope: 'identify email guilds guilds.members.read'
    });
    return `https://discord.com/oauth2/authorize?${params.toString()}`;
}

// 用授权码换取访问令牌
async function exchangeCode(code) {
    try {
        const response = await axios.post(
            `${DISCORD_API}/oauth2/token`,
            new URLSearchParams({
                client_id: config.DISCORD.CLIENT_ID,
                client_secret: config.DISCORD.CLIENT_SECRET,
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: config.DISCORD.REDIRECT_URI
            }),
            {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Discord token 交换失败:', error.response?.data || error.message);
        throw new Error('Discord 认证失败');
    }
}

// 获取用户信息
async function getDiscordUser(accessToken) {
    try {
        const response = await axios.get(`${DISCORD_API}/users/@me`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        return response.data;
    } catch (error) {
        console.error('获取 Discord 用户信息失败:', error.response?.data || error.message);
        throw new Error('获取用户信息失败');
    }
}

// 检查用户是否在指定服务器中
async function checkGuildMembership(userId) {
    try {
        const response = await axios.get(
            `${DISCORD_API}/guilds/${config.DISCORD.GUILD_ID}/members/${userId}`,
            {
                headers: { Authorization: `Bot ${config.DISCORD.BOT_TOKEN}` }
            }
        );
        return response.status === 200;
    } catch (error) {
        if (error.response?.status === 404) {
            return false;
        }
        console.error('检查服务器成员失败:', error.response?.data || error.message);
        throw new Error('验证服务器成员失败');
    }
}

module.exports = {
    getDiscordAuthUrl,
    exchangeCode,
    getDiscordUser,
    checkGuildMembership
};