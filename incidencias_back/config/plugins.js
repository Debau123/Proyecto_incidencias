module.exports = ({ env }) => ({
    email: {
      config: {
        provider: 'nodemailer',
        providerOptions: {
          host: 'smtp.gmail.com',
          port: 465,
          auth: {
            user: 'incidencia.salvador@gmail.com',
            pass: 'zgwlogcpxrbcdjht', // sin espacios, todo seguido
          },
          secure: true,
        },
        settings: {
          defaultFrom: 'incidencia.salvador@gmail.com',
          defaultReplyTo: 'incidencia.salvador@gmail.com',
        },
      },
    },
  });
  