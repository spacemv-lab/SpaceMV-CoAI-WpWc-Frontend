/**
 * 格物微信蓝 — 样式预设
 * 适用于微信公众号排版，蓝色科技风格
 */
export const gewuWechatBlue = {
  name: '格物微信蓝',
  platform: 'WECHAT_OFFICIAL_ACCOUNT',
  global: {
    fontFamily: '-apple-system, "Microsoft YaHei", sans-serif',
    padding: '10px 16px'
  },
  nodes: {
    h2: {
      color: '#548DD4',
      fontSize: '20px',
      fontWeight: 'bold',
      borderLeft: '3px solid #548DD4',
      paddingLeft: '12px',
      marginTop: '24px',
      marginBottom: '12px'
    },
    h3: {
      color: '#548DD4',
      fontSize: '17px',
      fontWeight: '600',
      borderLeft: '2px solid #548DD4',
      paddingLeft: '10px'
    },
    p: {
      fontSize: '14px',
      lineHeight: '1.75',
      color: '#333',
      marginBottom: '10px'
    },
    blockquote: {
      bgColor: '#F6F9FD',
      borderRadius: '8px',
      padding: '16px',
      borderLeft: 'none',
      margin: '16px 0'
    },
    chart: {
      mode: 'placeholder'
    },
    img: {
      borderRadius: '8px',
      maxWidth: '100%'
    }
  }
}
