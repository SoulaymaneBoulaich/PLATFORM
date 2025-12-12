import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
    en: {
        translation: {
            // Navigation
            "nav.home": "Home",
            "nav.properties": "Properties",
            "nav.dashboard": "Dashboard",
            "nav.messages": "Messages",
            "nav.login": "Login",
            "nav.getStarted": "Get Started",
            "nav.logout": "Logout",
            "nav.editProfile": "Edit Profile",
            "nav.settings": "Settings",

            // Account Settings
            "settings.title": "Account Settings",
            "settings.subtitle": "Manage your account preferences and settings",
            "settings.profile": "Profile",
            "settings.security": "Login & Security",
            "settings.notifications": "Notifications",
            "settings.appearance": "Appearance & Language",

            // Appearance
            "appearance.darkMode": "Dark Mode",
            "appearance.darkModeDesc": "Use dark theme across the application",
            "appearance.language": "Language",

            // Notifications
            "notifications.email": "Email Notifications",
            "notifications.emailDesc": "Receive email updates about messages and offers",
            "notifications.sms": "SMS Notifications",
            "notifications.smsDesc": "Receive text message alerts",

            // Profile
            "profile.editProfile": "Edit Profile",
            "profile.uploadPhoto": "Upload Photo",
            "profile.choosePhoto": "Choose Photo",
            "profile.firstName": "First Name",
            "profile.lastName": "Last Name",
            "profile.email": "Email",
            "profile.phone": "Phone",
            "profile.location": "Location",
            "profile.bio": "Bio",
            "profile.save": "Save Changes",
            "profile.cancel": "Cancel",

            // Security
            "security.currentPassword": "Current Password",
            "security.newPassword": "New Password",
            "security.confirmPassword": "Confirm New Password",
            "security.changePassword": "Change Password",

            // Common
            "common.loading": "Loading...",
            "common.saving": "Saving...",
            "common.uploading": "Uploading...",
            "common.search": "Search"
        }
    },
    fr: {
        translation: {
            // Navigation
            "nav.home": "Accueil",
            "nav.properties": "Propriétés",
            "nav.dashboard": "Tableau de bord",
            "nav.messages": "Messages",
            "nav.login": "Connexion",
            "nav.getStarted": "Commencer",
            "nav.logout": "Déconnexion",
            "nav.editProfile": "Modifier le profil",
            "nav.settings": "Paramètres",

            // Account Settings
            "settings.title": "Paramètres du compte",
            "settings.subtitle": "Gérez vos préférences et paramètres",
            "settings.profile": "Profil",
            "settings.security": "Connexion et sécurité",
            "settings.notifications": "Notifications",
            "settings.appearance": "Apparence et langue",

            // Appearance
            "appearance.darkMode": "Mode sombre",
            "appearance.darkModeDesc": "Utiliser le thème sombre",
            "appearance.language": "Langue",

            // Notifications
            "notifications.email": "Notifications par e-mail",
            "notifications.emailDesc": "Recevoir des mises à jour par e-mail",
            "notifications.sms": "Notifications SMS",
            "notifications.smsDesc": "Recevoir des alertes par SMS",

            // Profile
            "profile.editProfile": "Modifier le profil",
            "profile.uploadPhoto": "Télécharger une photo",
            "profile.choosePhoto": "Choisir une photo",
            "profile.firstName": "Prénom",
            "profile.lastName": "Nom",
            "profile.email": "E-mail",
            "profile.phone": "Téléphone",
            "profile.location": "Emplacement",
            "profile.bio": "Biographie",
            "profile.save": "Enregistrer",
            "profile.cancel": "Annuler",

            // Security
            "security.currentPassword": "Mot de passe actuel",
            "security.newPassword": "Nouveau mot de passe",
            "security.confirmPassword": "Confirmer le mot de passe",
            "security.changePassword": "Changer le mot de passe",

            // Common
            "common.loading": "Chargement...",
            "common.saving": "Enregistrement...",
            "common.uploading": "Téléchargement...",
            "common.search": "Rechercher"
        }
    },
    ar: {
        translation: {
            // Navigation
            "nav.home": "الرئيسية",
            "nav.properties": "العقارات",
            "nav.dashboard": "لوحة التحكم",
            "nav.messages": "الرسائل",
            "nav.login": "تسجيل الدخول",
            "nav.getStarted": "ابدأ الآن",
            "nav.logout": "تسجيل الخروج",
            "nav.editProfile": "تعديل الملف الشخصي",
            "nav.settings": "الإعدادات",

            // Account Settings
            "settings.title": "إعدادات الحساب",
            "settings.subtitle": "إدارة تفضيلات وإعدادات حسابك",
            "settings.profile": "الملف الشخصي",
            "settings.security": "تسجيل الدخول والأمان",
            "settings.notifications": "الإشعارات",
            "settings.appearance": "المظهر واللغة",

            // Appearance
            "appearance.darkMode": "الوضع الداكن",
            "appearance.darkModeDesc": "استخدام المظهر الداكن",
            "appearance.language": "اللغة",

            // Notifications
            "notifications.email": "إشعارات البريد الإلكتروني",
            "notifications.emailDesc": "تلقي التحديثات عبر البريد الإلكتروني",
            "notifications.sms": "إشعارات الرسائل النصية",
            "notifications.smsDesc": "تلقي التنبيهات عبر الرسائل النصية",

            // Profile
            "profile.editProfile": "تعديل الملف الشخصي",
            "profile.uploadPhoto": "تحميل صورة",
            "profile.choosePhoto": "اختر صورة",
            "profile.firstName": "الاسم الأول",
            "profile.lastName": "اسم العائلة",
            "profile.email": "البريد الإلكتروني",
            "profile.phone": "الهاتف",
            "profile.location": "الموقع",
            "profile.bio": "نبذة",
            "profile.save": "حفظ التغييرات",
            "profile.cancel": "إلغاء",

            // Security
            "security.currentPassword": "كلمة المرور الحالية",
            "security.newPassword": "كلمة المرور الجديدة",
            "security.confirmPassword": "تأكيد كلمة المرور",
            "security.changePassword": "تغيير كلمة المرور",

            // Common
            "common.loading": "جاري التحميل...",
            "common.saving": "جاري الحفظ...",
            "common.uploading": "جاري الرفع...",
            "common.search": "بحث"
        }
    },
    es: {
        translation: {
            // Navigation
            "nav.home": "Inicio",
            "nav.properties": "Propiedades",
            "nav.dashboard": "Panel",
            "nav.messages": "Mensajes",
            "nav.login": "Iniciar sesión",
            "nav.getStarted": "Empezar",
            "nav.logout": "Cerrar sesión",
            "nav.editProfile": "Editar perfil",
            "nav.settings": "Configuración",

            // Account Settings
            "settings.title": "Configuración de la cuenta",
            "settings.subtitle": "Administra tus preferencias y configuración",
            "settings.profile": "Perfil",
            "settings.security": "Inicio de sesión y seguridad",
            "settings.notifications": "Notificaciones",
            "settings.appearance": "Apariencia e idioma",

            // Appearance
            "appearance.darkMode": "Modo oscuro",
            "appearance.darkModeDesc": "Usar tema oscuro",
            "appearance.language": "Idioma",

            // Notifications
            "notifications.email": "Notificaciones por correo",
            "notifications.emailDesc": "Recibir actualizaciones por correo",
            "notifications.sms": "Notificaciones SMS",
            "notifications.smsDesc": "Recibir alertas por SMS",

            // Profile
            "profile.editProfile": "Editar perfil",
            "profile.uploadPhoto": "Subir foto",
            "profile.choosePhoto": "Elegir foto",
            "profile.firstName": "Nombre",
            "profile.lastName": "Apellido",
            "profile.email": "Correo electrónico",
            "profile.phone": "Teléfono",
            "profile.location": "Ubicación",
            "profile.bio": "Biografía",
            "profile.save": "Guardar cambios",
            "profile.cancel": "Cancelar",

            // Security
            "security.currentPassword": "Contraseña actual",
            "security.newPassword": "Nueva contraseña",
            "security.confirmPassword": "Confirmar contraseña",
            "security.changePassword": "Cambiar contraseña",

            // Common
            "common.loading": "Cargando...",
            "common.saving": "Guardando...",
            "common.uploading": "Subiendo...",
            "common.search": "Buscar"
        }
    }
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: 'en', // Default language
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
