// Encera profil yönlendirme yardımcı fonksiyonları

// Encera hesap bilgileri
export const ENCERA_CONFIG = {
    USER_ID: 1,
    EMAIL: 'admin@encera.com',
    FIRST_NAME: 'Encera',
    LAST_NAME: 'Admin',
    PHONE: '5356021168'
};

// Bir kullanıcının Encera olup olmadığını kontrol eder
export const isEnceraUser = (user: { id?: number; firstName?: string; email?: string }): boolean => {
    if (!user) return false;

    // ID ile kontrol
    if (user.id === ENCERA_CONFIG.USER_ID) return true;

    // Email ile kontrol
    if (user.email === ENCERA_CONFIG.EMAIL) return true;

    // İsim ile kontrol
    if (user.firstName === ENCERA_CONFIG.FIRST_NAME) return true;

    return false;
};

// Profil linkini oluşturur - Encera ise özel route'a yönlendirir
export const getProfileUrl = (user: { id?: number; firstName?: string; email?: string }): string => {
    if (isEnceraUser(user)) {
        return '/encera';
    }
    return `/profile/${user.id}`;
};

// Mesajlaşma için doğru kullanıcı ID'sini döner
export const getMessageUserId = (user: { id?: number; firstName?: string; email?: string }): number => {
    if (isEnceraUser(user)) {
        return ENCERA_CONFIG.USER_ID;
    }
    return user.id || 0;
};

// İlan sahibi Encera ise özel işlem yapar
export const handlePropertyOwnerRedirect = (owner: { id?: number; firstName?: string; email?: string }) => {
    if (isEnceraUser(owner)) {
        return {
            isEncera: true,
            profileUrl: '/encera',
            userId: ENCERA_CONFIG.USER_ID,
            displayName: ENCERA_CONFIG.FIRST_NAME
        };
    }

    return {
        isEncera: false,
        profileUrl: `/profile/${owner.id}`,
        userId: owner.id,
        displayName: `${owner.firstName || ''} ${owner.lastName || ''}`.trim()
    };
};