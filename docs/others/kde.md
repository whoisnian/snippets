# KDE 桌面环境

## 图标浏览器
KDE 在 `plasma-sdk` 包中提供了一个图标浏览器，用于浏览和搜索已安装的图标，旧版应用名为 `cuttlefish`，后续更名为 `iconexplorer`。

参考来源：[KDE Developer Documentation: Icons](https://develop.kde.org/docs/features/icons/#finding-the-right-icons)

## 文件管理器右键菜单
Dolphin 支持在 `~/.local/share/kio/servicemenus/` 下创建自定义的 `*.desktop` 文件，依据文件类型在右键菜单中添加不同的选项。例如对于图片文件添加“图像识别”选项，在子菜单中可选“识别为中文”“识别为英文”或“扫描二维码”，调用 `tesseract` 或 `zbarimg` 并在 `kdialog` 中展示结果。
```sh
[Desktop Entry]
Type=Service
MimeType=image/*;
Actions=scan-qrcode;ocr-eng;ocr-chi;
X-KDE-Submenu=图像识别

[Desktop Action ocr-chi]
Name=识别为中文
Icon=text-convert-to-regular
Exec=tesseract "%f" - -l chi_sim | kdialog --textbox - 640 512

[Desktop Action ocr-eng]
Name=识别为英文
Icon=text-convert-to-regular
Exec=tesseract "%f" - -l eng | kdialog --textbox - 640 512

[Desktop Action scan-qrcode]
Name=扫描二维码
Icon=view-barcode-qr
Exec=zbarimg --quiet "%f" | sed 's/^QR-Code://' | kdialog --textbox - 640 512
```

参考来源：[KDE Developer Documentation: Creating Dolphin service menus](https://develop.kde.org/docs/apps/dolphin/service-menus/)
