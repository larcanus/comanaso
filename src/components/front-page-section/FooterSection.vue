<script setup></script>

<template>
    <footer class="footer">
        <div class="footer-content">
            <div class="footer-copyright">
                <p>copyright © 2024</p>
                <p>| author Rylkov A. |</p>
                <p>v1.0.0</p>
            </div>
            <p>Связь со мной:</p>
            <a href="mailto:larcanus@yandex.ru" class="footer-email">larcanus@yandex.ru</a>
        </div>
    </footer>
</template>

<style scoped>
.footer {
    background-color: #1c1c1c;
    color: #9a9999;
    padding: 20px;
    text-align: center;
    width: 100%;
}

.footer p {
    text-align: center;
    margin: 0 3px 0 3px;
    font-size: 14px;
}

.footer-content {
    max-width: 800px;
    margin: 0 auto;
}

.footer-copyright {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
}

.footer-email {
    color: #467e91;
    text-decoration: none;
    transition: color 0.3s;
}

.footer-email:hover {
    color: #ff4500;
}

@media (max-width: 450px) {
    .footer-copyright {
        flex-direction: column;
    }
}
</style>
