import sys
import json
import os
from PyQt5.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout,
    QHBoxLayout, QPushButton, QTextBrowser, QStackedWidget
)

class PolePageViewer(QWidget):
    def __init__(self, config_path):
        super().__init__()
        self.index = 0
        self.stack = QStackedWidget()
        self.next_btn = QPushButton('Next')
        self.prev_btn = QPushButton('Back')
        self.prev_btn.setDisabled(True)

        self.load_config(config_path)
        self.build_pages()

        btn_layout = QHBoxLayout()
        btn_layout.addStretch()
        btn_layout.addWidget(self.prev_btn)
        btn_layout.addWidget(self.next_btn)

        layout = QVBoxLayout(self)
        layout.addWidget(self.stack)
        layout.addLayout(btn_layout)

        self.next_btn.clicked.connect(self.next_page)
        self.prev_btn.clicked.connect(self.prev_page)

    def load_config(self, path):
        with open(path, 'r', encoding='utf-8') as f:
            self.config = json.load(f)

    def build_pages(self):
        for page in self.config.get('pagelist', []):
            html_path = page.get('content', '')
            if html_path.startswith('./resources/app/'):
                html_path = html_path.replace('./resources/app/', '')
            browser = QTextBrowser()
            try:
                with open(html_path, 'r', encoding='utf-8') as hfile:
                    browser.setHtml(hfile.read())
            except Exception as e:
                browser.setText(f'Failed to load {html_path}: {e}')
            self.stack.addWidget(browser)
        if self.stack.count() <= 1:
            self.next_btn.setDisabled(True)

    def next_page(self):
        if self.index < self.stack.count() - 1:
            self.index += 1
            self.stack.setCurrentIndex(self.index)
            self.prev_btn.setEnabled(True)
        if self.index == self.stack.count() - 1:
            self.next_btn.setDisabled(True)

    def prev_page(self):
        if self.index > 0:
            self.index -= 1
            self.stack.setCurrentIndex(self.index)
            self.next_btn.setEnabled(True)
        if self.index == 0:
            self.prev_btn.setDisabled(True)

class PoleMainWindow(QMainWindow):
    def __init__(self, config_path):
        super().__init__()
        self.setWindowTitle('PolePosition PyQt Installer')
        self.viewer = PolePageViewer(config_path)
        self.setCentralWidget(self.viewer)
        self.resize(800, 600)

if __name__ == '__main__':
    app = QApplication(sys.argv)
    config_path = os.path.join(os.path.dirname(__file__), '..', 'pole_config.json')
    window = PoleMainWindow(config_path)
    window.show()
    sys.exit(app.exec_())
