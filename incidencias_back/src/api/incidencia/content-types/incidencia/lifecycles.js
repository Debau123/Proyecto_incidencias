module.exports = {
    async afterCreate(event) {
      const { result } = event;
  
      try {
        // Obtener técnicos
        const tecnicos = await strapi.entityService.findMany('plugin::users-permissions.user', {
          filters: { rol: 'tecnico' },
          fields: ['email', 'username'],
        });
  
        if (!tecnicos.length) return;
  
        // Obtener info del usuario y del dispositivo (populate)
        const incidenciaCompleta = await strapi.entityService.findOne('api::incidencia.incidencia', result.id, {
          populate: {
            user: true,
            dispositivo: true,
          },
        });
  
        const titulo = incidenciaCompleta.titulo;
        const descripcion = incidenciaCompleta.descripcion;
        const creador = incidenciaCompleta.user?.username || 'Usuario desconocido';
        const dispositivo = incidenciaCompleta.dispositivo?.modelo || 'Sin dispositivo';
        const id = incidenciaCompleta.id;
  
        // Enviar email a todos los técnicos
        await Promise.all(
          tecnicos.map((tecnico) =>
            strapi.plugins['email'].services.email.send({
              to: tecnico.email,
              subject: `🛠 Nueva incidencia: ${titulo}`,
              text: `
  Se ha creado una nueva incidencia.
  
  Título: ${titulo}
  Descripción: ${descripcion}
  Creada por: ${creador}
  Dispositivo: ${dispositivo}
  
  Ver incidencia: http://localhost:3000/tecnico/incidencia/${id}
              `,
              html: `
                <p>Se ha creado una nueva incidencia:</p>
                <ul>
                  <li><strong>Título:</strong> ${titulo}</li>
                  <li><strong>Descripción:</strong> ${descripcion}</li>
                  <li><strong>Creada por:</strong> ${creador}</li>
                  <li><strong>Dispositivo:</strong> ${dispositivo}</li>
                </ul>
                <p><a href="http://localhost:3000/tecnico/incidencia/${id}" target="_blank" style="color: #2563eb; font-weight: bold;">🔗 Ver incidencia</a></p>
              `,
            })
          )
        );
  
        strapi.log.info(`✅ Correo enviado a técnicos con la incidencia ID ${id}`);
      } catch (error) {
        strapi.log.error('❌ Error al enviar correo a técnicos:', error);
      }
    },
  };
  