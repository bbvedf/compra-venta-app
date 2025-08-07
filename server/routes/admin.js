const express = require('express');
const { Router } = express;
const router = Router();
const pool = require('../db');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const { sendUserApprovedEmail, sendUserRejectedEmail } = require('../utils/emailSender');


/**
 * @route GET /api/admin/users
 * @desc Obtener todos los usuarios (solo admin)
 * @access Private
 */
router.get('/users', verifyToken, isAdmin, async (req, res) => {
    try {
        const query = `
            SELECT 
                id,
                email,
                is_approved AS "isApproved",
                role,
                created_at AS "createdAt"
            FROM users
            ORDER BY created_at DESC
            `;
        const result = await pool.query(query);
        res.status(200).json({ users: result.rows });
    } catch (error) {
        console.error('Error en GET /api/admin/users:', error);
        res.status(500).json({ error: 'Error al obtener usuarios' });
    }
});

/**
 * @route PATCH /api/admin/users/:id
 * @desc Actualizar usuario (solo admin)
 * @access Private
 */
router.patch('/users/:id', verifyToken, isAdmin, async (req, res) => {
    const { id } = req.params;
    const { role, isApproved } = req.body; // Ojo: "isApproved" (en DB) vs "isApproved" (body)

    try {
        // 1. Obtenemos el usuario actual (necesitamos su email y estado de aprobación)
        const currentUser = await pool.query(
            'SELECT email, is_approved FROM users WHERE id = $1',
            [id]
        );

        if (currentUser.rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const { email, is_approved: currentApprovalStatus } = currentUser.rows[0];

        // 2. Actualizamos el usuario
        await pool.query(
            `UPDATE users 
             SET 
                is_approved = COALESCE($1, is_approved),
                role = COALESCE($2, role)
             WHERE id = $3`,
            [isApproved, role, id]
        );

        // 3. Verificamos si isApproved cambió (solo si se envió en el body)
        if (isApproved !== undefined && isApproved !== currentApprovalStatus) {
            if (isApproved) {
                await sendUserApprovedEmail(email); // Email de aprobación
            } else {
                await sendUserRejectedEmail(email); // Email de cancelación
            }
        }

        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        res.status(500).json({ error: 'Error al actualizar usuario' });
    }
});

/**
 * @route DELETE /api/admin/users/:id
 * @desc Eliminar usuario (solo admin)
 * @access Private
 */
router.delete('/users/:id', verifyToken, isAdmin, async (req, res) => {
    const { id } = req.params;

    try {
        // 1. Verificamos primero que el usuario existe
        const userCheck = await pool.query(
            'SELECT id FROM users WHERE id = $1',
            [id]
        );

        if (userCheck.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Usuario no encontrado'
            });
        }

        // 2. Eliminación directa (ya no necesitamos transacción)
        await pool.query('DELETE FROM users WHERE id = $1', [id]);

        // 3. Respuesta JSON consistente
        res.status(200).json({
            success: true,
            message: 'Usuario eliminado correctamente'
        });
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor',
            details: error.message
        });
    }
});

module.exports = router;