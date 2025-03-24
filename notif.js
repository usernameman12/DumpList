(() => {
    class NotificationSystem {
        constructor() {
            this.notifications = [];
            this.init();
        }

        init() {
          // styles lmao
            const styles = `
                .notification-container {
                    position: fixed;
                    top: 10px;
                    right: 10px;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    z-index: 1000;
                }
                .notification {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    width: 300px;
                    padding: 10px;
                    border-radius: 5px;
                    color: white;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    transform: translateX(120%);
                    opacity: 0;
                    transition: transform 0.3s ease, opacity 0.3s ease;
                }
                .notification.visible {
                    transform: translateX(0);
                    opacity: 1;
                }
                .notif-info { background-color: #3498db; }
                .notif-warn { background-color: #f39c12; }
                .notif-success { background-color: #2ecc71; }
                .notif-close {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 1.2rem;
                    cursor: pointer;
                }
                .notification-bell {
                    position: fixed;
                    top: 10px;
                    right: -60px;
                    cursor: pointer;
                    transition: right 0.3s ease;
                }
                .notification-bell.visible { right: 10px; }
                @keyframes shake {
                    10%, 90% { transform: rotate(-3deg); }
                    20%, 80% { transform: rotate(3deg); }
                    30%, 50%, 70% { transform: rotate(-3deg); }
                    40%, 60% { transform: rotate(3deg); }
                }
                .notification-bell.shake { animation: shake 0.5s; }
            `;
            const styleTag = document.createElement("style");
            styleTag.innerHTML = styles;
            document.head.appendChild(styleTag);

            // Create notification container
            this.container = document.createElement("div");
            this.container.classList.add("notification-container");
            document.body.appendChild(this.container);

            // only good use of chatgpt, is svg
            this.bell = document.createElement("div");
            this.bell.classList.add("notification-bell");
            this.bell.innerHTML = `
                <svg viewBox="0 0 79 79" width="48" height="48">
                    <g stroke="currentColor" stroke-width="4">
                        <g transform="translate(2 2)">
                            <g transform="translate(37.5 0)">
                                <circle cx="0" cy="8" r="8"></circle>
                                <circle class="bell__clapper" cx="0" cy="63" r="12"></circle>
                                <path class="bell__body" stroke-linejoin="round"
                                    d="M 0 8 a 25 25 0 0 1 25 25 v 17 l 5 6 q 3 7 -6 7 h -48 q -9 0 -6 -7 l 5 -6 v -17 a 25 25 0 0 1 25 -25">
                                </path>
                            </g>
                        </g>
                    </g>
                </svg>
            `;
            document.body.appendChild(this.bell);
            this.bell.addEventListener("click", () => this.toggleNotifications());

            this.hideBell();
        }

        showBell() {
            this.bell.classList.add("visible");
        }

        hideBell() {
            this.bell.classList.remove("visible");
        }

        createNotification(message, type) {
            const notif = document.createElement("div");
            notif.classList.add("notification", `notif-${type}`);
            notif.innerHTML = `
                <div class="notif-content">
                    <strong>${type.toUpperCase()}</strong>
                    <p>${message}</p>
                </div>
                <button class="notif-close">&times;</button>
            `;

            this.container.appendChild(notif);
            this.notifications.push(notif);
            this.showBell();

            // Close
            notif.querySelector(".notif-close").addEventListener("click", () => {
                this.dismissNotification(notif);
            });

            setTimeout(() => notif.classList.add("visible"), 100);
        }

        dismissNotification(notif) {
            notif.classList.remove("visible");
            setTimeout(() => {
                notif.remove();
                this.notifications = this.notifications.filter(n => n !== notif);
                if (this.notifications.length === 0) this.hideBell();
            }, 300);
        }

        toggleNotifications() {
            if (this.notifications.length === 0) return;
            const isVisible = this.notifications[0].classList.contains("visible");
            this.notifications.forEach(notif => {
                notif.classList.toggle("visible", !isVisible);
            });
        }

        alertInfo(message) {
            this.createNotification(message, "info");
        }

        alertWarn(message) {
            this.createNotification(message, "warn");
        }

        alertSuccess(message) {
            this.createNotification(message, "success");
        }
    }

    // global instance
    const NotificationLib = new NotificationSystem();

    // functions 
    window.alertInfo = (msg) => NotificationLib.alertInfo(msg);
    window.alertWarn = (msg) => NotificationLib.alertWarn(msg);
    window.alertSuccess = (msg) => NotificationLib.alertSuccess(msg);
})();
