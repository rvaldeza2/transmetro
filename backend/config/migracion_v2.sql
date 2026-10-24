-- =====================================================================
-- Migración v2: registro / recuperación de contraseña, visitas del
-- recorrido e historial de alertas.
-- La aplica el servidor al arrancar (config/migraciones.js) si la base
-- todavía tiene el esquema anterior; también se puede correr a mano una vez
-- sobre la base del db.sql original (no borra datos). Una instalación
-- nueva solo necesita db.sql.
-- =====================================================================

SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS visita (
    id_visita             INT AUTO_INCREMENT PRIMARY KEY,
    id_bus                INT NOT NULL,
    id_estacion           INT NOT NULL,
    fecha_hora            DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    pasajeros             INT NOT NULL CHECK (pasajeros >= 0),
    espera_adicional_min  INT NOT NULL DEFAULT 0 CHECK (espera_adicional_min >= 0),
    CONSTRAINT fk_visita_bus
        FOREIGN KEY (id_bus) REFERENCES bus(id_bus) ON DELETE CASCADE,
    CONSTRAINT fk_visita_estacion
        FOREIGN KEY (id_estacion) REFERENCES estacion(id_estacion) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS alerta (
    id_alerta    INT AUTO_INCREMENT PRIMARY KEY,
    tipo         VARCHAR(20) NOT NULL CHECK (tipo IN ('SOBRECUPO', 'ESPERA')),
    id_estacion  INT NULL,
    id_bus       INT NULL,
    pasajeros    INT NOT NULL CHECK (pasajeros >= 0),
    porcentaje   NUMERIC(7,2) NULL,
    mensaje      VARCHAR(255) NOT NULL,
    fecha_hora   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atendida     BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_alerta_estacion
        FOREIGN KEY (id_estacion) REFERENCES estacion(id_estacion) ON DELETE CASCADE,
    CONSTRAINT fk_alerta_bus
        FOREIGN KEY (id_bus) REFERENCES bus(id_bus) ON DELETE CASCADE
);

-- Va al final: si algo de arriba falla, el servidor vuelve a intentar la migración al reiniciar
ALTER TABLE usuario
    ADD COLUMN pregunta_seguridad   VARCHAR(150) NULL,
    ADD COLUMN respuesta_seguridad  VARCHAR(100) NULL;

-- Respuesta de los usuarios de prueba: azul
UPDATE usuario
SET pregunta_seguridad  = '¿Cuál es su color favorito?',
    respuesta_seguridad = '$2b$10$Ovo9TE3lxk8lpROkqIB3q.S0o0sx1sQ.hc5sJQgl.d16S39kEU.2S'
WHERE usuario IN ('admin', 'operador', 'consulta');
