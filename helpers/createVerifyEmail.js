const { BASE_URL } = process.env;

const createVerifyEmail = ({ email, verificationToken }) => {
  const verifyEmail = {
    to: email,
    subject: 'Підтвердження електронної пошти',
    html: `
      <p>Вітаємо!</p>
      <p>Дякуємо за реєстрацію на нашому сервісі. Для завершення процесу реєстрації та активації облікового запису, будь ласка, підтвердьте свою електронну пошту, натиснувши на посилання нижче:</p>
      <p><a href="${BASE_URL}/users/verify/${verificationToken}" target="_blank">Підтвердити електронну пошту</a></p>
      <p>Це допоможе забезпечити безпеку вашого облікового запису та допоможе нам надати вам найкращий досвід використання нашого сервісу.</p>
      <p>Якщо ви не реєструвалися на нашому сервісі, натисніть на посилання нижче і ми видалимо цей обліковий запис.</p>
      <p><a href="${BASE_URL}/users/delete/${verificationToken}" target="_blank">Видалити обліковий запис</a></p>
      <p>Дякуємо, що обрали наш сервіс!</p>
    `,
  };

  return verifyEmail;
};

export default createVerifyEmail;
