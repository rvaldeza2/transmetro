DROP DATABASE IF EXISTS transmetro;
CREATE DATABASE transmetro CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE transmetro;
SET NAMES utf8mb4;


-- =====================================================================
-- TABLAS
-- =====================================================================

CREATE TABLE municipalidad (
    id_municipalidad  INT AUTO_INCREMENT PRIMARY KEY,
    nombre            VARCHAR(150) NOT NULL,
    direccion         VARCHAR(255)
);

CREATE TABLE linea (
    id_linea            INT AUTO_INCREMENT PRIMARY KEY,
    nombre              VARCHAR(100) NOT NULL,
    distancia_total_km  NUMERIC(6,2) CHECK (distancia_total_km >= 0),
    id_municipalidad    INT NOT NULL,
    CONSTRAINT fk_linea_municipalidad
        FOREIGN KEY (id_municipalidad) REFERENCES municipalidad(id_municipalidad)
);

CREATE TABLE estacion (
    id_estacion       INT AUTO_INCREMENT PRIMARY KEY,
    nombre            VARCHAR(100) NOT NULL,
    id_municipalidad  INT NOT NULL,
    CONSTRAINT fk_estacion_municipalidad
        FOREIGN KEY (id_municipalidad) REFERENCES municipalidad(id_municipalidad)
);

-- Entidad asociativa N:M entre linea y estacion (orden de recorrido)
CREATE TABLE linea_estacion (
    id_linea                INT NOT NULL,
    id_estacion             INT NOT NULL,
    orden_visita            INT NOT NULL CHECK (orden_visita > 0),
    distancia_siguiente_km  NUMERIC(6,2) CHECK (distancia_siguiente_km >= 0),
    PRIMARY KEY (id_linea, id_estacion),
    CONSTRAINT fk_le_linea
        FOREIGN KEY (id_linea) REFERENCES linea(id_linea),
    CONSTRAINT fk_le_estacion
        FOREIGN KEY (id_estacion) REFERENCES estacion(id_estacion),
    CONSTRAINT uq_linea_orden UNIQUE (id_linea, orden_visita)
);

CREATE TABLE acceso (
    id_acceso    INT AUTO_INCREMENT PRIMARY KEY,
    nombre       VARCHAR(100) NOT NULL,
    id_estacion  INT NOT NULL,
    CONSTRAINT fk_acceso_estacion
        FOREIGN KEY (id_estacion) REFERENCES estacion(id_estacion)
);

CREATE TABLE guardia (
    id_guardia  INT AUTO_INCREMENT PRIMARY KEY,
    nombre      VARCHAR(150) NOT NULL,
    turno       VARCHAR(50)
);

CREATE TABLE acceso_guardia (
    id_acceso         INT NOT NULL,
    id_guardia        INT NOT NULL,
    fecha_asignacion  DATE NOT NULL DEFAULT (CURRENT_DATE),
    PRIMARY KEY (id_acceso, id_guardia),
    CONSTRAINT fk_ag_acceso
        FOREIGN KEY (id_acceso) REFERENCES acceso(id_acceso),
    CONSTRAINT fk_ag_guardia
        FOREIGN KEY (id_guardia) REFERENCES guardia(id_guardia)
);

CREATE TABLE parqueo (
    id_parqueo   INT AUTO_INCREMENT PRIMARY KEY,
    ubicacion    VARCHAR(150) NOT NULL,
    id_estacion  INT NOT NULL,
    CONSTRAINT fk_parqueo_estacion
        FOREIGN KEY (id_estacion) REFERENCES estacion(id_estacion)
);

CREATE TABLE bus (
    id_bus      INT AUTO_INCREMENT PRIMARY KEY,
    placa       VARCHAR(15) NOT NULL UNIQUE,
    capacidad   INT NOT NULL CHECK (capacidad > 0),
    id_linea    INT NULL,       -- puede no estar asignado a ninguna linea
    id_parqueo  INT NOT NULL,   -- todo bus debe tener siempre un parqueo
    CONSTRAINT fk_bus_linea
        FOREIGN KEY (id_linea) REFERENCES linea(id_linea),
    CONSTRAINT fk_bus_parqueo
        FOREIGN KEY (id_parqueo) REFERENCES parqueo(id_parqueo)
);

CREATE TABLE piloto (
    id_piloto            INT AUTO_INCREMENT PRIMARY KEY,
    nombre               VARCHAR(150) NOT NULL,
    historial_educativo  VARCHAR(255),
    residencia           VARCHAR(255),
    telefono             VARCHAR(20),
    id_bus               INT NULL,
    CONSTRAINT fk_piloto_bus
        FOREIGN KEY (id_bus) REFERENCES bus(id_bus)
);

CREATE TABLE operador (
    id_operador  INT AUTO_INCREMENT PRIMARY KEY,
    nombre       VARCHAR(150) NOT NULL,
    id_estacion  INT NOT NULL,
    CONSTRAINT fk_operador_estacion
        FOREIGN KEY (id_estacion) REFERENCES estacion(id_estacion)
);

-- Usuarios de la aplicación; el acceso se restringe según el rol (RNF04)
-- contrasena guarda el hash bcrypt, nunca la contraseña en texto plano
CREATE TABLE usuario (
    id_usuario  INT AUTO_INCREMENT PRIMARY KEY,
    nombre      VARCHAR(150) NOT NULL,
    usuario     VARCHAR(50) NOT NULL UNIQUE,
    contrasena  VARCHAR(100) NOT NULL,
    rol         VARCHAR(20) NOT NULL CHECK (rol IN ('ADMINISTRADOR', 'OPERADOR', 'CONSULTA')),
    -- Recuperación de contraseña: la respuesta también se guarda como hash bcrypt
    pregunta_seguridad   VARCHAR(150) NULL,
    respuesta_seguridad  VARCHAR(100) NULL
);

-- Visitas que cada unidad realiza a las estaciones durante su recorrido
CREATE TABLE visita (
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

-- Historial de alertas: sobrecupo en estación (150%) y espera adicional de bus (25%)
CREATE TABLE alerta (
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


-- =====================================================================
-- DATOS DE PRUEBA
-- =====================================================================

INSERT INTO municipalidad (id_municipalidad, nombre, direccion) VALUES
(1, 'Municipalidad de Guatemala',             '21 calle 6-77 zona 1, Palacio Municipal'),
(2, 'Municipalidad de Mixco',                 '4a calle 2-28 zona 1, Mixco'),
(3, 'Municipalidad de Villa Nueva',           '5a avenida 4-50 zona 1, Villa Nueva'),
(4, 'Municipalidad de San Miguel Petapa',     '2a calle 3-15 zona 1, San Miguel Petapa'),
(5, 'Municipalidad de Santa Catarina Pinula', '1a calle 4-20 zona 1, Santa Catarina Pinula');

-- distancia_total_km = suma de distancia_siguiente_km de sus estaciones
INSERT INTO linea (id_linea, nombre, distancia_total_km, id_municipalidad) VALUES
(1, 'Línea 12',          9.50,  1),
(2, 'Línea 13',          8.00,  1),
(3, 'Línea Mixco',       11.20, 2),
(4, 'Línea Villa Nueva', 11.50, 3),
(5, 'Línea Petapa',      6.60,  4);

INSERT INTO estacion (id_estacion, nombre, id_municipalidad) VALUES
(1,  'Centra Sur',           1),
(2,  'Javier',               1),
(3,  'Trébol',               1),
(4,  'Plaza Barrios',        1),
(5,  'Plaza Municipal',      1),
(6,  'Tívoli',               1),
(7,  'Plaza España',         1),
(8,  'Hipódromo',            1),
(9,  'Calzada San Juan',     2),
(10, 'Molino de las Flores', 2),
(11, 'Mixco Centro',         2),
(12, 'Villalobos',           3),
(13, 'Bárcenas',             3),
(14, 'Villa Nueva Centro',   3),
(15, 'Villa Hermosa',        4),
(16, 'Petapa Centro',        4);

INSERT INTO linea_estacion (id_linea, id_estacion, orden_visita, distancia_siguiente_km) VALUES
(1, 1, 1, 2.10), (1, 2, 2, 3.40), (1, 3, 3, 2.80), (1, 4, 4, 1.20), (1, 5, 5, NULL),
(2, 3, 1, 2.60), (2, 6, 2, 1.10), (2, 7, 3, 4.30), (2, 8, 4, NULL),
(3, 3, 1, 3.90), (3, 9, 2, 4.20), (3, 10, 3, 3.10), (3, 11, 4, NULL),
(4, 1, 1, 3.20), (4, 12, 2, 4.50), (4, 13, 3, 3.80), (4, 14, 4, NULL),
(5, 12, 1, 3.70), (5, 15, 2, 2.90), (5, 16, 3, NULL);

INSERT INTO acceso (id_acceso, nombre, id_estacion) VALUES
(1,  'Acceso Norte',        1),
(2,  'Acceso Sur',          1),
(3,  'Conexión Centra Sur', 1),
(4,  'Acceso Principal',    2),
(5,  'Acceso Norte',        3),
(6,  'Acceso Sur',          3),
(7,  'Pasarela Roosevelt',  3),
(8,  'Acceso Oriente',      4),
(9,  'Acceso Poniente',     4),
(10, 'Acceso Norte',        5),
(11, 'Acceso Sur',          5),
(12, 'Acceso Principal',    6),
(13, 'Acceso Principal',    7),
(14, 'Acceso Norte',        8),
(15, 'Acceso Sur',          8),
(16, 'Acceso Principal',    9),
(17, 'Acceso Principal',    10),
(18, 'Acceso Norte',        11),
(19, 'Acceso Sur',          11),
(20, 'Acceso Principal',    12),
(21, 'Acceso Principal',    13),
(22, 'Acceso Norte',        14),
(23, 'Acceso Sur',          14),
(24, 'Acceso Principal',    15),
(25, 'Acceso Principal',    16);

INSERT INTO guardia (id_guardia, nombre, turno) VALUES
(1,  'Pedro Antonio Xicará Coj',          'Matutino'),
(2,  'Manuel de Jesús López Ajú',         'Matutino'),
(3,  'Santos Eliseo Chen Caal',           'Vespertino'),
(4,  'Rigoberto Tzoc Pérez',              'Matutino'),
(5,  'Hugo Leonel Arana Ruiz',            'Matutino'),
(6,  'Fredy Orlando Sic Ixchop',          'Vespertino'),
(7,  'Elmer Danilo Paredes Hernández',    'Matutino'),
(8,  'Walter Amílcar Quiñónez Bran',      'Matutino'),
(9,  'Mynor Estuardo Alvarado Sosa',      'Vespertino'),
(10, 'Ronaldo Cux Chávez',                'Matutino'),
(11, 'Jorge Mario Oliva Galindo',         'Vespertino'),
(12, 'Sergio Iván Recinos Marroquín',     'Matutino'),
(13, 'Gladys Marisol Pocop Yax',          'Matutino'),
(14, 'Abner Joel Tobar Estrada',          'Vespertino'),
(15, 'Darwin Ottoniel Ajcalón Xoy',       'Matutino'),
(16, 'Cristian Rafael Mazariegos Polanco','Matutino'),
(17, 'Rosa Amelia Choc Bol',              'Vespertino'),
(18, 'Julio Roberto Samayoa Lara',        'Matutino'),
(19, 'Brenda Yesenia Girón Monroy',       'Vespertino'),
(20, 'Ángel Gabriel Sincal Mux',          'Matutino'),
(21, 'Víctor Hugo Escobar Arévalo',       'Matutino'),
(22, 'Edgar Leonel Tum Batz',             'Vespertino'),
(23, 'Nelson Iván Corado Valle',          'Matutino'),
(24, 'Alma Leticia Pacheco Rivas',        'Matutino'),
(25, 'Francisco Javier Najarro Molina',   'Matutino'),
(26, 'Josué Daniel Cano Urízar',          'Nocturno'),
(27, 'Lester Alfredo Godoy Archila',      'Nocturno'),
(28, 'Marta Julia Gálvez Toledo',         'Nocturno');

INSERT INTO acceso_guardia (id_acceso, id_guardia, fecha_asignacion) VALUES
(1, 1, '2026-09-01'),   (2, 2, '2026-09-01'),   (3, 3, '2026-09-01'),   (4, 4, '2026-09-01'),
(5, 5, '2026-09-01'),   (6, 6, '2026-09-01'),   (7, 7, '2026-09-01'),   (8, 8, '2026-09-01'),
(9, 9, '2026-09-01'),   (10, 10, '2026-09-01'), (11, 11, '2026-09-01'), (12, 12, '2026-09-01'),
(13, 13, '2026-09-01'), (14, 14, '2026-09-01'), (15, 15, '2026-09-01'), (16, 16, '2026-09-01'),
(17, 17, '2026-09-01'), (18, 18, '2026-09-01'), (19, 19, '2026-09-01'), (20, 20, '2026-09-01'),
(21, 21, '2026-09-01'), (22, 22, '2026-09-01'), (23, 23, '2026-09-01'), (24, 24, '2026-09-01'),
(25, 25, '2026-09-01'),
(1, 26, '2026-09-10'),  (5, 27, '2026-09-10'),  (7, 28, '2026-09-10');

INSERT INTO parqueo (id_parqueo, ubicacion, id_estacion) VALUES
(1, 'Predio Centra Sur',         1),
(2, 'Predio Plaza Municipal',    5),
(3, 'Predio Hipódromo',          8),
(4, 'Predio Mixco Centro',       11),
(5, 'Predio Villa Nueva Centro', 14),
(6, 'Predio Petapa Centro',      16);

INSERT INTO bus (id_bus, placa, capacidad, id_linea, id_parqueo) VALUES
(1,  'U-101TMG', 160, 1, 1),
(2,  'U-102TMG', 160, 1, 1),
(3,  'U-103TMG', 160, 1, 1),
(4,  'U-104TMG', 160, 1, 1),
(5,  'U-105TMG', 160, 1, 2),
(6,  'U-106TMG', 160, 1, 2),
(7,  'U-201TMG', 160, 2, 3),
(8,  'U-202TMG', 160, 2, 3),
(9,  'U-203TMG', 160, 2, 3),
(10, 'U-204TMG',  90, 2, 3),
(11, 'U-205TMG',  90, 2, 3),
(12, 'U-301TMG',  90, 3, 4),
(13, 'U-302TMG',  90, 3, 4),
(14, 'U-303TMG',  90, 3, 4),
(15, 'U-304TMG',  90, 3, 4),
(16, 'U-401TMG', 160, 4, 5),
(17, 'U-402TMG', 160, 4, 5),
(18, 'U-403TMG', 160, 4, 5),
(19, 'U-404TMG', 160, 4, 5),
(20, 'U-405TMG', 160, 4, 1),
(21, 'U-501TMG',  90, 5, 6),
(22, 'U-502TMG',  90, 5, 6),
(23, 'U-503TMG',  90, 5, 6),
(24, 'U-901TMG', 160, NULL, 1),
(25, 'U-902TMG',  90, NULL, 2);

INSERT INTO piloto (id_piloto, nombre, historial_educativo, residencia, telefono, id_bus) VALUES
(1,  'Carlos Enrique Pérez López',      'Perito Contador; Mecánica Diésel (INTECAP)',             '12 calle 5-40 zona 4, Villa Nueva',              '5541-7896', 1),
(2,  'José Luis García Morales',        'Bachiller en Ciencias y Letras',                        '3a avenida 14-22 zona 6, Guatemala',             '5236-5478', 2),
(3,  'Juan Carlos Hernández Ramírez',   'Bachiller en Computación; pensum cerrado USAC',          'Colonia Primero de Julio, Mixco',                '4278-9456', 3),
(4,  'Marvin Estuardo Gómez Castillo',  'Ciclo Básico; Conducción de Vehículos Pesados',          '5a avenida 9-30 zona 1, Mixco',                  '5214-7852', 4),
(5,  'Edwin Rolando Méndez Cruz',       'Bachiller en Ciencias y Letras',                        'Residenciales Las Flores, San Miguel Petapa',    '5295-8741', 5),
(6,  'Byron Alexander Juárez Orellana', 'Perito en Administración',                              '19 calle 7-11 zona 12, Guatemala',               '3203-6985', 6),
(7,  'Mario Roberto Sánchez Flores',    'Maestro de Educación Primaria',                         '2a calle 3-45 zona 3, Villa Nueva',              '5287-4125', 7),
(8,  'Luis Fernando Ramos Aguilar',     'Bachiller en Ciencias y Letras; Atención al Cliente',    'Lotificación El Frutal, Villa Nueva',            '4263-2587', 8),
(9,  'Otto René Barrios Chávez',        'Ciclo Básico; Mecánica Automotriz (INTECAP)',            '24 avenida 33-10 zona 5, Guatemala',             '5241-2365', 9),
(10, 'Erick Josué Monterroso Pineda',   'Perito Contador',                                       'Colonia El Milagro, Mixco',                      '3298-5632', 10),
(11, 'Wilson Abel Cifuentes Reyes',     'Bachiller en Ciencias y Letras',                        '6a avenida 2-50 zona 1, Santa Catarina Pinula',  '5214-7963', 11),
(12, 'Selvin Omar Gutiérrez Pérez',     'Bachiller en Computación',                              'Ciudad Real II, Villa Nueva',                    '4236-9852', 12),
(13, 'Ana Lucía Morales Díaz',          'Secretariado Bilingüe; Conducción de Vehículos Pesados', '15 avenida 10-33 zona 7, Guatemala',             '5275-3159', 13),
(14, 'Henry Estuardo Ortiz Velásquez',  'Perito en Mecánica',                                    'Planes de Bárcenas, Villa Nueva',                '5295-1357', 14),
(15, 'Rony Adolfo Castañeda Mejía',     'Ciclo Básico',                                          'Aldea Playa de Oro, San Miguel Petapa',          '4215-9753', 15),
(16, 'Kevin Alejandro Rodas Fuentes',   'Bachiller; estudiante de Ingeniería Industrial (UMG)',   '30 calle 8-77 zona 12, Guatemala',               '3235-7951', 16),
(17, 'María José Ixcot Tum',            'Maestra de Educación Primaria',                         'Colonia Lo de Fuentes, Mixco',                   '5246-8135', 17),
(18, 'Óscar Armando Lemus Paz',         'Sexto Primaria; Conducción de Vehículos Pesados',        'Colonia Peronia, Villa Nueva',                   '5257-9246', 18),
(19, 'Julio César Batres Solís',        'Perito en Electricidad',                                '11 avenida 4-27 zona 2, Mixco',                  '4268-0357', 19),
(20, 'Gerson David Coronado Lima',      'Bachiller en Ciencias y Letras',                        'Residenciales Pinula, Santa Catarina Pinula',    '3279-1468', 20),
(21, 'Lidia Esperanza Sut Ajpop',       'Perito Contador; Conducción de Vehículos Pesados',       'Villa Hermosa, San Miguel Petapa',               '5288-3141', 21),
(22, 'Rafael Antonio Mus Choy',         'Bachiller en Ciencias y Letras',                        'Colonia Santa Inés, San Miguel Petapa',          '4277-6620', 22),
(23, 'Hugo Armando Gramajo Fuentes',    'Perito en Mecánica',                                    'Bárcenas, Villa Nueva',                          '5310-4489', 23),
(24, 'Douglas Efraín Ac Tiul',          'Ciclo Básico',                                          '4a calle 6-12 zona 18, Guatemala',               '3344-1907', NULL);

INSERT INTO operador (id_operador, nombre, id_estacion) VALUES
(1,  'Andrea Sofía Castillo Mérida',       1),
(2,  'Diego Alejandro Figueroa Soto',      2),
(3,  'Karla Patricia Rosales Vides',       3),
(4,  'Jonathan Isaac Barrientos Paiz',     4),
(5,  'Mónica Gabriela Solórzano Cruz',     5),
(6,  'Esteban Josué Mérida Ralda',         6),
(7,  'Lucía Fernanda Chacón Ruano',        7),
(8,  'Rodrigo Andrés Villeda Carías',      8),
(9,  'Paola Alejandra Herrera Duarte',     9),
(10, 'Allan Ricardo Cordón Muñoz',         10),
(11, 'Silvia Marleny Ajanel Vicente',      11),
(12, 'Héctor Manuel Portillo Ochoa',       12),
(13, 'Daniela María Maldonado Mazariegos', 13),
(14, 'Fernando José Asturias Leiva',       14),
(15, 'Claudia Lorena Pinto Sagastume',     15),
(16, 'Marco Tulio Bonilla Argueta',        16);

-- Contraseña de los tres usuarios de prueba: Transmetro2026!
-- Respuesta a la pregunta de seguridad: azul
INSERT INTO usuario (id_usuario, nombre, usuario, contrasena, rol, pregunta_seguridad, respuesta_seguridad) VALUES
(1, 'Administrador de la Mancomunidad', 'admin',    '$2a$10$Mw1yUROHoFWfVXryNG58c.IopOUkNtUXTuxNoIpBgq2MK3GQd5t4W', 'ADMINISTRADOR', '¿Cuál es su color favorito?', '$2b$10$Ovo9TE3lxk8lpROkqIB3q.S0o0sx1sQ.hc5sJQgl.d16S39kEU.2S'),
(2, 'Andrea Sofía Castillo Mérida',     'operador', '$2a$10$Mw1yUROHoFWfVXryNG58c.IopOUkNtUXTuxNoIpBgq2MK3GQd5t4W', 'OPERADOR',      '¿Cuál es su color favorito?', '$2b$10$Ovo9TE3lxk8lpROkqIB3q.S0o0sx1sQ.hc5sJQgl.d16S39kEU.2S'),
(3, 'Usuario de consulta',              'consulta', '$2a$10$Mw1yUROHoFWfVXryNG58c.IopOUkNtUXTuxNoIpBgq2MK3GQd5t4W', 'CONSULTA',      '¿Cuál es su color favorito?', '$2b$10$Ovo9TE3lxk8lpROkqIB3q.S0o0sx1sQ.hc5sJQgl.d16S39kEU.2S');

-- Recorrido de ejemplo: bus U-101TMG (Línea 12) y U-201TMG (Línea 13)
INSERT INTO visita (id_bus, id_estacion, fecha_hora, pasajeros, espera_adicional_min) VALUES
(1, 1, '2026-10-15 06:00:00', 95, 0),
(1, 2, '2026-10-15 06:07:00', 120, 0),
(1, 3, '2026-10-15 06:15:00', 140, 0),
(1, 4, '2026-10-15 06:22:00', 60, 0),
(1, 5, '2026-10-15 06:27:00', 30, 5),
(7, 3, '2026-10-15 06:05:00', 110, 0),
(7, 6, '2026-10-15 06:10:00', 25, 5),
(7, 7, '2026-10-15 06:21:00', 70, 0);

INSERT INTO alerta (tipo, id_estacion, id_bus, pasajeros, porcentaje, mensaje, fecha_hora, atendida) VALUES
('ESPERA',    5,    1, 30,  18.75, 'Ocupación de 18.75%: el bus debe esperar 5 minutos adicionales', '2026-10-15 06:27:00', TRUE),
('ESPERA',    6,    7, 25,  15.63, 'Ocupación de 15.63%: el bus debe esperar 5 minutos adicionales', '2026-10-15 06:10:00', TRUE),
('SOBRECUPO', 3, NULL, 3200, 161.62, 'Sobrecupo de 161.62%: solicitar envío de un bus adicional', '2026-10-15 07:30:00', FALSE);
