# 房貸成數與所得試算 (whatittakes2buyahouse)

預估各方案下房貸成數對應的稅後年薪門檻。Fork / 重構自
[`eddielin836/howmuchineed2buyahouse`](https://github.com/eddielin836/howmuchineed2buyahouse)。

線上版： **https://&lt;your-github-username&gt;.github.io/whatittakes2buyahouse/**

## 開發

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # 產出 dist/
npm run preview  # 預覽 build 結果
```

## 部署

每次 push 到 `main` 會自動觸發 `.github/workflows/deploy.yml`：build → 上傳 →
GitHub Pages。第一次推上去後，到 repo 的 **Settings → Pages → Source** 改為
**GitHub Actions**，下次 push 就會自動發布。

版本號（畫面右下）會在 build 時自動帶入 git short SHA。

## 主要程式碼

```
App.tsx                slim shell — state + side-effects + layout
sections/              整段 UI（BorrowerSection、PropertySection、…）
components/            可重用控件（NumberField、Toggle、Segmented…）
constants.ts           方案標籤、預設利率、DTI 倍數、縣市生活費表
utils.ts               PMT、年限、主表、寬限期試算
types.ts
```

## License

Apache-2.0
