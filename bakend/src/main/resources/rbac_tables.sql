-- ============================================================
-- Module RBAC : roles, permissions, role_permissions, utilisateur_roles
-- À exécuter sur la base GestionHospitaliereDB (SQL Server)
-- ============================================================

-- Table permissions
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'permissions')
BEGIN
    CREATE TABLE permissions (
        id_permission   BIGINT IDENTITY(1,1) NOT NULL,
        code            NVARCHAR(60) NOT NULL,
        libelle         NVARCHAR(150) NOT NULL,
        description     NVARCHAR(255) NULL,
        module          NVARCHAR(50) NULL,
        CONSTRAINT PK_permissions PRIMARY KEY (id_permission)
    );
    CREATE UNIQUE INDEX IX_permissions_code ON permissions (code);
END

-- Table roles
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'roles')
BEGIN
    CREATE TABLE roles (
        id_role         BIGINT IDENTITY(1,1) NOT NULL,
        nom             NVARCHAR(30) NOT NULL,
        description     NVARCHAR(255) NULL,
        CONSTRAINT PK_roles PRIMARY KEY (id_role)
    );
    CREATE UNIQUE INDEX IX_roles_nom ON roles (nom);
END

-- Table role_permissions
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'role_permissions')
BEGIN
    CREATE TABLE role_permissions (
        id_role         BIGINT NOT NULL,
        id_permission   BIGINT NOT NULL,
        CONSTRAINT PK_role_permissions PRIMARY KEY (id_role, id_permission),
        CONSTRAINT FK_role_permissions_role FOREIGN KEY (id_role) REFERENCES roles (id_role),
        CONSTRAINT FK_role_permissions_permission FOREIGN KEY (id_permission) REFERENCES permissions (id_permission)
    );
END

-- Table utilisateur_roles
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'utilisateur_roles')
BEGIN
    CREATE TABLE utilisateur_roles (
        id_utilisateur  BIGINT NOT NULL,
        id_role         BIGINT NOT NULL,
        CONSTRAINT PK_utilisateur_roles PRIMARY KEY (id_utilisateur, id_role),
        CONSTRAINT FK_utilisateur_roles_utilisateur FOREIGN KEY (id_utilisateur) REFERENCES utilisateurs (Id),
        CONSTRAINT FK_utilisateur_roles_role FOREIGN KEY (id_role) REFERENCES roles (id_role)
    );
    CREATE INDEX IX_utilisateur_roles_id_role ON utilisateur_roles (id_role);
END