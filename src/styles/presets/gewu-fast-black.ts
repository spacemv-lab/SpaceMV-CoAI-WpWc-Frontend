/**
 * 格物快讯黑 — 样式预设
 * 适用于微信公众号快讯/资讯风格，黑色简洁
 */
export const gewuFastBlack = {
  name: '格物快讯黑',
  platform: 'WECHAT_OFFICIAL_ACCOUNT',
  global: {
    fontFamily: '-apple-system, "Microsoft YaHei", sans-serif',
    padding: '8px 14px'
  },
  nodes: {
    h2: {
      color: '#1a1a1a',
      fontSize: '18px',
      fontWeight: 'bold',
      borderLeft: '3px solid #1a1a1a',
      paddingLeft: '12px',
      marginTop: '20px',
      marginBottom: '10px'
    },
    h3: {
      color: '#1a1a1a',
      fontSize: '16px',
      fontWeight: '600',
      borderLeft: '2px solid #1a1a1a',
      paddingLeft: '10px'
    },
    p: {
      fontSize: '15px',
      lineHeight: '1.6',
      color: '#444',
      marginBottom: '10px'
    },
    blockquote: {
      bgColor: '#F5F5F5',
      borderRadius: '0px',
      padding: '14px',
      borderLeft: '3px solid #1a1a1a',
      margin: '14px 0'
    },
    chart: {
      mode: 'placeholder'
    },
    img: {
      borderRadius: '4px',
      maxWidth: '100%'
    }
  }
}
