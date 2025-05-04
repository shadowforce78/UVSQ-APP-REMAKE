@echo off
echo ===================================
echo    UVSQ-App - Script de build
echo ===================================

:: Définition des variables
set DIST_DIR=deploy
set CLIENT_DIR=%cd%
set SERVER_DIR=%cd%\server
set BUILD_TIME=%date% %time%

echo.
echo Heure de build: %BUILD_TIME%
echo.

:: Création du dossier de distribution s'il n'existe pas
echo [1/7] Création du dossier de distribution...
if exist %DIST_DIR% (
    echo Suppression de l'ancien dossier de distribution...
    rmdir /s /q %DIST_DIR%
)
mkdir %DIST_DIR%
mkdir %DIST_DIR%\server
echo Fait.

:: Installation des dépendances client
echo.
echo [2/7] Installation des dépendances client...
call npm install
if %errorlevel% neq 0 (
    echo Erreur lors de l'installation des dépendances client.
    goto :error
)
echo Fait.

:: Build du client
echo.
echo [3/7] Compilation de l'application client...
call npm run build
if %errorlevel% neq 0 (
    echo Erreur lors de la compilation du client.
    goto :error
)
echo Fait.

:: Copie des fichiers client dans le dossier de distribution
echo.
echo [4/7] Copie des fichiers client compilés...
xcopy /E /I /Y dist\* %DIST_DIR%\client\
if %errorlevel% neq 0 (
    echo Erreur lors de la copie des fichiers client.
    goto :error
)
echo Fait.

:: Installation des dépendances serveur
echo.
echo [5/7] Installation des dépendances serveur...
cd %SERVER_DIR%
call npm install
if %errorlevel% neq 0 (
    echo Erreur lors de l'installation des dépendances serveur.
    cd %CLIENT_DIR%
    goto :error
)
cd %CLIENT_DIR%
echo Fait.

:: Copie des fichiers serveur
echo.
echo [6/7] Copie des fichiers serveur...
xcopy /E /I /Y server\* %DIST_DIR%\server\
del %DIST_DIR%\server\README.md 2>nul
echo Fait.

:: Création des scripts de démarrage
echo.
echo [7/7] Création des scripts de démarrage...
(
echo @echo off
echo echo Démarrage du serveur UVSQ-App...
echo cd server
echo node server.js
) > %DIST_DIR%\start-server.bat

(
echo #!/bin/bash
echo echo "Démarrage du serveur UVSQ-App..."
echo cd server
echo node server.js
) > %DIST_DIR%\start-server.sh

:: Création d'un fichier readme pour le déploiement
echo.
echo Création du fichier README de déploiement...
(
echo # UVSQ-App - Instructions de déploiement
echo.
echo ## Build effectué le: %BUILD_TIME%
echo.
echo ## Structure des fichiers
echo - /client - Application front-end compilée
echo - /server - Serveur back-end
echo - start-server.bat - Script de démarrage pour Windows
echo - start-server.sh - Script de démarrage pour Linux/macOS
echo.
echo ## Instructions de déploiement
echo.
echo ### Option 1: Déploiement manuel
echo 1. Copiez tout le contenu de ce dossier sur votre serveur
echo 2. Assurez-vous que Node.js est installé sur votre serveur
echo 3. Démarrez le serveur avec le script approprié:
echo    - Sur Windows: `start-server.bat`
echo    - Sur Linux/macOS: `chmod +x start-server.sh && ./start-server.sh`
echo.
echo ### Option 2: Déploiement avec PM2 ^(recommandé pour la production^)
echo 1. Installez PM2 sur votre serveur: `npm install -g pm2`
echo 2. Naviguez dans le dossier server
echo 3. Démarrez l'application avec PM2: `pm2 start server.js --name uvsq-app`
echo 4. Pour configurer le démarrage automatique: `pm2 startup` puis suivez les instructions
echo 5. Sauvegardez la configuration: `pm2 save`
) > %DIST_DIR%\README.md

echo.
echo ===================================
echo  Build terminé avec succès!
echo  Les fichiers se trouvent dans le dossier: %DIST_DIR%
echo ===================================
echo.
goto :end

:error
echo.
echo ===================================
echo  Erreur pendant le build!
echo ===================================
exit /b 1

:end
